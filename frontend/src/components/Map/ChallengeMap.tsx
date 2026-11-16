import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { LatLng, Street } from '../../types/map'
import { distanceMeters, segmentStaysOnStreets, snapToStreet } from '../../utils/geoUtils'
import { fetchStreets } from './streets'

const SEATTLE: LatLng = [47.6062, -122.3321]
const ROUTE_COLOR = '#ffc000'

type ChallengeMapProps = {
  strokes: LatLng[][]
  onStrokesChange: (strokes: LatLng[][]) => void
}

function MapControls({ onLocation }: { onLocation: (point: LatLng) => void }) {
  const map = useMap()
  const onLocationRef = useRef(onLocation)
  onLocationRef.current = onLocation

  const readLocation = (center: boolean) => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: LatLng = [position.coords.latitude, position.coords.longitude]
        onLocationRef.current(point)
        if (center) map.setView(point, Math.max(map.getZoom(), 16))
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
  }

  useEffect(() => {
    readLocation(false)
  }, [map])

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
      <button type="button" className="map-locate" aria-label="Center on your location" onClick={() => readLocation(true)}>
        <span className="map-locate-icon" aria-hidden="true" />
      </button>
    </>
  )
}

function StreetLayer({ onStreets }: { onStreets: (streets: Street[] | null) => void }) {
  const map = useMap()
  const onStreetsRef = useRef(onStreets)
  onStreetsRef.current = onStreets

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null
    let timer: number | undefined

    const load = () => {
      if (!active) return
      if (!map.getSize().x || !map.getSize().y) {
        timer = window.setTimeout(load, 100)
        return
      }
      controller?.abort()
      const request = new AbortController()
      controller = request
      const bounds = map.getBounds().pad(0.2)
      const span = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      }

      fetchStreets(span, request.signal)
        .then((streets) => {
          if (!active || request.signal.aborted) return
          if (streets == null && map.getZoom() >= 15) return
          onStreetsRef.current(streets)
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
        })
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(load, 200)
    }

    map.whenReady(schedule)
    map.on('moveend', schedule)
    map.on('resize', schedule)
    schedule()

    return () => {
      active = false
      controller?.abort()
      window.clearTimeout(timer)
      map.off('moveend', schedule)
      map.off('resize', schedule)
    }
  }, [map])

  return null
}

function SketchLayer({
  strokes,
  onStrokesChange,
  streets,
}: ChallengeMapProps & { streets: Street[] | null }) {
  const map = useMap()
  const strokesRef = useRef(strokes)
  const onChangeRef = useRef(onStrokesChange)
  const streetsRef = useRef(streets)
  const drawing = useRef(false)
  const [blocked, setBlocked] = useState(false)
  strokesRef.current = strokes
  onChangeRef.current = onStrokesChange
  streetsRef.current = streets

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

    let blockedTimer: number | undefined
    const markBlocked = () => {
      setBlocked(true)
      window.clearTimeout(blockedTimer)
      blockedTimer = window.setTimeout(() => setBlocked(false), 1400)
    }

    const onStreet = (point: LatLng) => {
      const streets = streetsRef.current
      if (!streets) return null
      return snapToStreet(point, streets)
    }

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || isControl(event)) return
      const point = onStreet(toLatLng(event))
      if (!point) {
        markBlocked()
        return
      }
      event.preventDefault()
      try {
        container.setPointerCapture(event.pointerId)
      } catch {
        // Untrusted pointers still draw from move events on the map.
      }
      drawing.current = true
      commit([...strokesRef.current, [point]])
    }

    const onMove = (event: PointerEvent) => {
      if (!drawing.current || !event.isPrimary) return
      event.preventDefault()
      const finished = strokesRef.current.slice(0, -1)
      const current = strokesRef.current[strokesRef.current.length - 1] ?? []
      const previous = current[current.length - 1]
      const next = onStreet(toLatLng(event))
      const streets = streetsRef.current
      if (!next || (previous && streets && !segmentStaysOnStreets(previous, next, streets))) {
        markBlocked()
        return
      }
      if (previous && distanceMeters(previous, next) < 2) return
      commit([...finished, [...current, next]])
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
      window.clearTimeout(blockedTimer)
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup', onUp)
      container.removeEventListener('pointercancel', onUp)
    }
  }, [map])

  return (
    <>
      {blocked ? (
        <p className="map-blocked" role="status">
          You can't plan a route on a building
        </p>
      ) : null}
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
  const [streets, setStreets] = useState<Street[] | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://openfreemap.org">OpenFreeMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <StreetLayer onStreets={setStreets} />
        <SketchLayer strokes={strokes} onStrokesChange={onStrokesChange} streets={streets} />
        {location ? (
          <CircleMarker
            center={location}
            radius={7}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: '#2f80ed',
              fillOpacity: 1,
              interactive: false,
            }}
          />
        ) : null}
        <MapControls onLocation={setLocation} />
      </MapContainer>
    </div>
  )
}
