import type { LatLng, Street } from '../types/map'

const SNAP_METERS = 8

export function distanceMeters(start: LatLng, end: LatLng) {
  const latScale = 111_320
  const lngScale = 111_320 * Math.cos((((start[0] + end[0]) / 2) * Math.PI) / 180)
  return Math.hypot((end[0] - start[0]) * latScale, (end[1] - start[1]) * lngScale)
}

function closestOnSegment(point: LatLng, start: LatLng, end: LatLng): LatLng {
  const lngScale = Math.cos((point[0] * Math.PI) / 180)
  const ax = start[1] * lngScale
  const ay = start[0]
  const bx = end[1] * lngScale
  const by = end[0]
  const px = point[1] * lngScale
  const py = point[0]
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const ratio = lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio]
}

export function snapToStreet(point: LatLng, streets: Street[]) {
  const pad = SNAP_METERS / 111_320
  let closest: LatLng | null = null
  let closestDistance = SNAP_METERS

  for (const street of streets) {
    if (
      street.maxLat < point[0] - pad ||
      street.minLat > point[0] + pad ||
      street.maxLng < point[1] - pad * 1.6 ||
      street.minLng > point[1] + pad * 1.6
    ) {
      continue
    }

    for (let index = 1; index < street.line.length; index += 1) {
      const candidate = closestOnSegment(point, street.line[index - 1], street.line[index])
      const distance = distanceMeters(point, candidate)
      if (distance < closestDistance) {
        closest = candidate
        closestDistance = distance
      }
    }
  }

  return closest
}

export function segmentStaysOnStreets(start: LatLng, end: LatLng, streets: Street[]) {
  const steps = Math.min(40, Math.max(1, Math.ceil(distanceMeters(start, end) / 4)))

  for (let step = 0; step <= steps; step += 1) {
    const ratio = step / steps
    const sample: LatLng = [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio]
    if (!snapToStreet(sample, streets)) return false
  }

  return true
}

function strokeLengthKm(points: LatLng[]) {
  const earthRadiusKm = 6371
  let total = 0

  for (let index = 1; index < points.length; index += 1) {
    const [lat1, lng1] = points[index - 1]
    const [lat2, lng2] = points[index]
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    total += 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(a)))
  }

  return total
}

export function routeLengthKm(strokes: LatLng[][]) {
  return strokes.reduce((total, stroke) => total + strokeLengthKm(stroke), 0)
}
