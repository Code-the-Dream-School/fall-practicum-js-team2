import { useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'

export type LatLng = [number, number]

const SEATTLE: LatLng = [47.6062, -122.3321]
const ROUTE_COLOR = '#ffc000'

type ChallengeMapProps = {
  strokes: LatLng[][]
  onStrokesChange: (strokes: LatLng[][]) => void
}

function MapControls() {
  const map = useMap()

  const locate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], map.getZoom())
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
  }

  return (
    <>
      <div className="map-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}>
          −
        </button>
      </div>
      <button type="button" className="map-locate" aria-label="Center on your location" onClick={locate}>
        <span className="map-locate-icon" aria-hidden="true" />
      </button>
    </>
  )
}

function SketchLayer({ strokes, onStrokesChange }: ChallengeMapProps) {
  const map = useMap()
  const strokesRef = useRef(strokes)
  const onChangeRef = useRef(onStrokesChange)
  const drawing = useRef(false)
  strokesRef.current = strokes
  onChangeRef.current = onStrokesChange

  useEffect(() => {
    map.dragging.disable()
    map.boxZoom.disable()
    map.doubleClickZoom.disable()
    map.attributionControl.setPrefix('')

    return () => {
      map.dragging.enable()
      map.boxZoom.enable()
      map.doubleClickZoom.enable()
    }
  }, [map])

  useEffect(() => {
    const container = map.getContainer()

    const toLatLng = (event: PointerEvent): LatLng => {
      const latlng = map.mouseEventToLatLng(event)
      return [latlng.lat, latlng.lng]
    }

    const isControl = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return false
      return Boolean(target.closest('.map-zoom, .map-locate, .leaflet-control'))
    }

    const commit = (next: LatLng[][]) => {
      strokesRef.current = next
      onChangeRef.current(next)
    }

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || isControl(event)) return
      event.preventDefault()
      try {
        container.setPointerCapture(event.pointerId)
      } catch {
        // Untrusted pointers still draw from move events on the map.
      }
      drawing.current = true
      commit([...strokesRef.current, [toLatLng(event)]])
    }

    const onMove = (event: PointerEvent) => {
      if (!drawing.current || !event.isPrimary) return
      event.preventDefault()
      const finished = strokesRef.current.slice(0, -1)
      const current = strokesRef.current[strokesRef.current.length - 1] ?? []
      commit([...finished, [...current, toLatLng(event)]])
    }

    const onUp = (event: PointerEvent) => {
      if (!drawing.current) return
      drawing.current = false
      try {
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId)
        }
      } catch {
        // The stroke is already finished.
      }
    }

    container.addEventListener('pointerdown', onDown)
    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerup', onUp)
    container.addEventListener('pointercancel', onUp)

    return () => {
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup', onUp)
      container.removeEventListener('pointercancel', onUp)
    }
  }, [map])

  return (
    <>
      {strokes.map((stroke, index) =>
        stroke.length >= 2 ? (
          <Polyline
            key={index}
            positions={stroke}
            pathOptions={{ color: ROUTE_COLOR, weight: 5, lineCap: 'round', lineJoin: 'round' }}
          />
        ) : (
          <CircleMarker
            key={index}
            center={stroke[0]}
            radius={5}
            pathOptions={{ color: ROUTE_COLOR, fillColor: ROUTE_COLOR, fillOpacity: 1, weight: 0 }}
          />
        ),
      )}
    </>
  )
}

export function ChallengeMap({ strokes, onStrokesChange }: ChallengeMapProps) {
  return (
    <div className="live-map">
      <MapContainer
        center={SEATTLE}
        zoom={16}
        zoomControl={false}
        attributionControl
        style={{ height: 320, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SketchLayer strokes={strokes} onStrokesChange={onStrokesChange} />
        <MapControls />
      </MapContainer>
    </div>
  )
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
