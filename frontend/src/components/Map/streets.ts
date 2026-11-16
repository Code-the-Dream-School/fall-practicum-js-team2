import type { LatLng, Street } from '../../types/map'

type Bounds = {
  south: number
  west: number
  north: number
  east: number
}

type Reader = {
  bytes: Uint8Array
  offset: number
}

type TileSource = {
  template: string
  maxZoom: number
}

const TILEJSON_URL = 'https://tiles.openfreemap.org/planet'
const WALKABLE_CLASSES = new Set(['primary', 'secondary', 'tertiary', 'minor', 'service'])
const MAX_SPAN = 0.08
const MAX_TILES = 9

const tileStreets = new Map<string, Promise<Street[]>>()
let tileSource: Promise<TileSource> | null = null

function readVarint(reader: Reader) {
  let value = 0
  let shift = 0

  for (;;) {
    if (reader.offset >= reader.bytes.length) throw new Error('Truncated vector tile')
    const byte = reader.bytes[reader.offset++]
    value += (byte & 0x7f) * 2 ** shift
    if ((byte & 0x80) === 0) return value
    shift += 7
    if (shift > 49) throw new Error('Vector tile varint is too long')
  }
}

function skipField(reader: Reader, wire: number) {
  if (wire === 0) {
    readVarint(reader)
    return
  }
  if (wire === 1) {
    reader.offset += 8
    return
  }
  if (wire === 2) {
    reader.offset += readVarint(reader)
    return
  }
  if (wire === 5) {
    reader.offset += 4
    return
  }
  throw new Error(`Unsupported vector tile field type ${wire}`)
}

function readMessage(reader: Reader) {
  const length = readVarint(reader)
  const start = reader.offset
  reader.offset += length
  if (reader.offset > reader.bytes.length) throw new Error('Truncated vector tile')
  return reader.bytes.subarray(start, reader.offset)
}

function zigzag(value: number) {
  return (value >>> 1) ^ -(value & 1)
}

function decodeLines(geometry: number[]) {
  const lines: Array<Array<{ x: number; y: number }>> = []
  let line: Array<{ x: number; y: number }> = []
  let x = 0
  let y = 0
  let cursor = 0

  while (cursor < geometry.length) {
    const command = geometry[cursor++]
    const id = command & 0x7
    const count = command >> 3

    if (id === 1) {
      line = []
      lines.push(line)
      for (let step = 0; step < count; step += 1) {
        x += zigzag(geometry[cursor++])
        y += zigzag(geometry[cursor++])
        line.push({ x, y })
      }
    } else if (id === 2) {
      for (let step = 0; step < count; step += 1) {
        x += zigzag(geometry[cursor++])
        y += zigzag(geometry[cursor++])
        line.push({ x, y })
      }
    } else if (id === 7 && line.length > 0) {
      const first = line[0]
      const last = line[line.length - 1]
      if (first.x !== last.x || first.y !== last.y) line.push(first)
    }
  }

  return lines.filter((points) => points.length >= 2)
}

function parseStringValue(bytes: Uint8Array) {
  const reader: Reader = { bytes, offset: 0 }
  while (reader.offset < reader.bytes.length) {
    const key = readVarint(reader)
    const field = key >> 3
    const wire = key & 0x7
    if (field === 1 && wire === 2) return new TextDecoder().decode(readMessage(reader))
    skipField(reader, wire)
  }
  return null
}

type Building = {
  outer: LatLng[]
  holes: LatLng[][]
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

function readFeature(bytes: Uint8Array, keys: string[], values: Array<string | null>) {
  const reader: Reader = { bytes, offset: 0 }
  let type = 0
  let roadClass: string | null = null
  const geometry: number[] = []

  while (reader.offset < reader.bytes.length) {
    const key = readVarint(reader)
    const field = key >> 3
    const wire = key & 0x7

    if (field === 2 && wire === 2) {
      const packed: Reader = { bytes: readMessage(reader), offset: 0 }
      const tags: number[] = []
      while (packed.offset < packed.bytes.length) tags.push(readVarint(packed))
      for (let index = 0; index + 1 < tags.length; index += 2) {
        if (keys[tags[index]] === 'class') roadClass = values[tags[index + 1]] ?? null
      }
    } else if (field === 3 && wire === 0) {
      type = readVarint(reader)
    } else if (field === 4 && wire === 2) {
      const packed: Reader = { bytes: readMessage(reader), offset: 0 }
      while (packed.offset < packed.bytes.length) geometry.push(readVarint(packed))
    } else if (field === 4 && wire === 0) {
      geometry.push(readVarint(reader))
    } else {
      skipField(reader, wire)
    }
  }

  return { type, roadClass, lines: decodeLines(geometry) }
}

function pointToLatLng(
  tileX: number,
  tileY: number,
  zoom: number,
  extent: number,
  point: { x: number; y: number },
): LatLng {
  const scale = 2 ** zoom
  const lng = ((tileX + point.x / extent) / scale) * 360 - 180
  const mercator = Math.PI * (1 - (2 * (tileY + point.y / extent)) / scale)
  const lat = (Math.atan(Math.sinh(mercator)) * 180) / Math.PI
  return [lat, lng]
}

function toStreet(id: string, line: LatLng[]): Street | null {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const [lat, lng] of line) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return { id, line, minLat, maxLat, minLng, maxLng }
}

function ringBounds(ring: LatLng[]) {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const [lat, lng] of ring) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return { minLat, maxLat, minLng, maxLng }
}

function signedArea(ring: LatLng[]) {
  let sum = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    sum += ring[index][1] * ring[index + 1][0] - ring[index + 1][1] * ring[index][0]
  }
  return sum
}

function pointInRing(point: LatLng, ring: LatLng[]) {
  let inside = false

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const start = ring[previous]
    const end = ring[index]
    const crosses =
      start[0] > point[0] !== end[0] > point[0] &&
      point[1] < ((end[1] - start[1]) * (point[0] - start[0])) / (end[0] - start[0]) + start[1]
    if (crosses) inside = !inside
  }

  return inside
}

function insideBuilding(point: LatLng, buildings: Building[]) {
  for (const building of buildings) {
    if (
      point[0] < building.minLat ||
      point[0] > building.maxLat ||
      point[1] < building.minLng ||
      point[1] > building.maxLng
    ) {
      continue
    }
    if (!pointInRing(point, building.outer)) continue
    if (building.holes.some((hole) => pointInRing(point, hole))) continue
    return true
  }

  return false
}

function toBuildings(rings: LatLng[][]) {
  const buildings: Building[] = []

  for (const ring of rings) {
    if (ring.length < 4) continue
    const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring : [...ring, ring[0]]
    if (signedArea(closed) < 0) {
      buildings.push({ outer: closed, holes: [], ...ringBounds(closed) })
    } else if (buildings.length > 0) {
      buildings[buildings.length - 1].holes.push(closed)
    }
  }

  return buildings
}

function streetsOutsideBuildings(streets: Street[], buildings: Building[]) {
  if (buildings.length === 0) return streets
  const kept: Street[] = []

  for (const street of streets) {
    let current: LatLng[] = []
    let piece = 0
    const save = () => {
      const next = toStreet(`${street.id}/${piece}`, current)
      piece += 1
      current = []
      if (next) kept.push(next)
    }

    for (let index = 1; index < street.line.length; index += 1) {
      const start = street.line[index - 1]
      const end = street.line[index]
      const throughBuilding = [0.25, 0.5, 0.75].some((ratio) => {
        const sample: LatLng = [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio]
        return insideBuilding(sample, buildings)
      })
      if (throughBuilding) {
        if (current.length >= 2) save()
        else current = []
        continue
      }
      if (current.length === 0) current.push(start)
      current.push(end)
    }

    if (current.length >= 2) save()
  }

  return kept
}

function parseLayer(bytes: Uint8Array, tileX: number, tileY: number, zoom: number) {
  const reader: Reader = { bytes, offset: 0 }
  let name = ''
  let extent = 4096
  const keys: string[] = []
  const values: Array<string | null> = []
  const features: Uint8Array[] = []

  while (reader.offset < reader.bytes.length) {
    const key = readVarint(reader)
    const field = key >> 3
    const wire = key & 0x7

    if (field === 1 && wire === 2) name = new TextDecoder().decode(readMessage(reader))
    else if (field === 2 && wire === 2) features.push(readMessage(reader))
    else if (field === 3 && wire === 2) keys.push(new TextDecoder().decode(readMessage(reader)))
    else if (field === 4 && wire === 2) values.push(parseStringValue(readMessage(reader)))
    else if (field === 5 && wire === 0) extent = readVarint(reader)
    else skipField(reader, wire)
  }

  const project = (line: Array<{ x: number; y: number }>) =>
    line.map((point) => pointToLatLng(tileX, tileY, zoom, extent, point))

  if (name === 'transportation') {
    const streets: Street[] = []
    features.forEach((feature, featureIndex) => {
      const decoded = readFeature(feature, keys, values)
      if (decoded.type !== 2 || !decoded.roadClass || !WALKABLE_CLASSES.has(decoded.roadClass)) return
      decoded.lines.forEach((line, lineIndex) => {
        const street = toStreet(`${tileX}/${tileY}/${featureIndex}/${lineIndex}`, project(line))
        if (street) streets.push(street)
      })
    })
    return { streets, buildings: [] as Building[] }
  }

  if (name === 'building') {
    const buildings: Building[] = []
    for (const feature of features) {
      const decoded = readFeature(feature, keys, values)
      if (decoded.type !== 3) continue
      buildings.push(...toBuildings(decoded.lines.map(project)))
    }
    return { streets: [] as Street[], buildings }
  }

  return { streets: [] as Street[], buildings: [] as Building[] }
}

function parseStreets(bytes: Uint8Array, tileX: number, tileY: number, zoom: number) {
  const reader: Reader = { bytes, offset: 0 }
  const streets: Street[] = []
  const buildings: Building[] = []

  while (reader.offset < reader.bytes.length) {
    const key = readVarint(reader)
    const field = key >> 3
    const wire = key & 0x7

    if (field === 3 && wire === 2) {
      const layer = parseLayer(readMessage(reader), tileX, tileY, zoom)
      streets.push(...layer.streets)
      buildings.push(...layer.buildings)
    } else {
      skipField(reader, wire)
    }
  }

  return streetsOutsideBuildings(streets, buildings)
}

function longitudeToTileX(longitude: number, zoom: number) {
  return Math.floor(((longitude + 180) / 360) * 2 ** zoom)
}

function latitudeToTileY(latitude: number, zoom: number) {
  const radians = (latitude * Math.PI) / 180
  const mercator = Math.log(Math.tan(radians) + 1 / Math.cos(radians))
  return Math.floor(((1 - mercator / Math.PI) / 2) * 2 ** zoom)
}

function loadTileSource() {
  if (!tileSource) {
    tileSource = fetch(TILEJSON_URL)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Map tiles failed (${response.status})`)
        const payload = (await response.json()) as { tiles?: string[]; maxzoom?: number }
        const template = payload.tiles?.[0]
        if (!template) throw new Error('Map tiles are missing a template')
        return { template, maxZoom: payload.maxzoom ?? 14 }
      })
      .catch((error: unknown) => {
        tileSource = null
        throw error
      })
  }

  return tileSource
}

function loadTile(source: TileSource, tileX: number, tileY: number) {
  const zoom = source.maxZoom
  const url = source.template.replace('{z}', String(zoom)).replace('{x}', String(tileX)).replace('{y}', String(tileY))
  const cached = tileStreets.get(url)
  if (cached) return cached

  const pending = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Map tile failed (${response.status})`)
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (bytes.length === 0) return []
      return parseStreets(bytes, tileX, tileY, zoom)
    })
    .catch((error: unknown) => {
      tileStreets.delete(url)
      throw error
    })

  tileStreets.set(url, pending)
  return pending
}

function overlaps(bounds: Bounds, street: Street) {
  return (
    street.maxLat >= bounds.south &&
    street.minLat <= bounds.north &&
    street.maxLng >= bounds.west &&
    street.minLng <= bounds.east
  )
}

export async function fetchStreets(bounds: Bounds, signal: AbortSignal) {
  if (bounds.north - bounds.south > MAX_SPAN || bounds.east - bounds.west > MAX_SPAN || bounds.west > bounds.east) {
    return null
  }

  const source = await loadTileSource()
  if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError')

  const zoom = source.maxZoom
  const minX = longitudeToTileX(bounds.west, zoom)
  const maxX = longitudeToTileX(bounds.east, zoom)
  const minY = latitudeToTileY(bounds.north, zoom)
  const maxY = latitudeToTileY(bounds.south, zoom)
  if ((maxX - minX + 1) * (maxY - minY + 1) > MAX_TILES) return null

  const tiles: Array<Promise<Street[]>> = []
  for (let tileX = minX; tileX <= maxX; tileX += 1) {
    for (let tileY = minY; tileY <= maxY; tileY += 1) tiles.push(loadTile(source, tileX, tileY))
  }

  const streets = (await Promise.all(tiles)).flat().filter((street) => overlaps(bounds, street))
  if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError')
  return streets
}
