import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'

type LatLng = [number, number]

const shape: LatLng[] = [
  [47.6062, -122.3321],
  [47.6072, -122.3321],
  [47.6072, -122.3306],
  [47.6062, -122.3306],
  [47.6062, -122.3321],
]

const fakeWalk: LatLng[] = [
  [47.6062, -122.3321],
  [47.6065, -122.3321],
  [47.6068, -122.3321],
  [47.6068, -122.3316],
  [47.6068, -122.3311],
]

const PLAYERS = [
  { id: 't1', letter: 'T', highlighted: true },
  { id: 't2', letter: 'T', highlighted: false },
  { id: 'a1', letter: 'A', highlighted: false },
  { id: 'a2', letter: 'A', highlighted: false },
]

function colorForSegment(a: LatLng, b: LatLng) {
  const up = b[0] - a[0]
  const right = b[1] - a[1]
  if (Math.abs(up) > Math.abs(right)) return up > 0 ? '#2a9d8f' : '#e76f51'
  return right > 0 ? '#e9c46a' : '#264653'
}

function FitShape() {
  const map = useMap()

  useEffect(() => {
    map.attributionControl.setPrefix('')
    const frame = requestAnimationFrame(() => {
      map.invalidateSize()
      map.fitBounds(shape, { padding: [36, 36] })
    })
    return () => cancelAnimationFrame(frame)
  }, [map])

  return null
}

function MapControls() {
  const map = useMap()

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
      <button
        type="button"
        className="map-locate"
        aria-label="Center on the shape"
        onClick={() => map.fitBounds(shape, { padding: [36, 36] })}
      >
        <span className="map-locate-icon" aria-hidden="true" />
      </button>
    </>
  )
}

type ChallengeMapProps = {
  paused?: boolean
}

export function ChallengeMap({ paused = false }: ChallengeMapProps) {
  const [path, setPath] = useState<LatLng[]>([])

  useEffect(() => {
    if (paused) return

    let index = path.length
    const timer = setInterval(() => {
      if (index >= fakeWalk.length) {
        clearInterval(timer)
        return
      }
      const point = fakeWalk[index]
      setPath((current) => [...current, point])
      index += 1
    }, 1000)

    return () => clearInterval(timer)
  }, [paused, path.length])

  return (
    <div className="live-map">
      <MapContainer
        center={shape[0]}
        zoom={16}
        zoomControl={false}
        attributionControl
        style={{ height: 320, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={shape} pathOptions={{ color: '#e7eef5', weight: 4, dashArray: '6 8' }} />
        {path.slice(1).map((point, index) => (
          <Polyline
            key={index}
            positions={[path[index], point]}
            pathOptions={{ color: colorForSegment(path[index], point), weight: 5 }}
          />
        ))}
        {path.length > 0 && <CircleMarker center={path[path.length - 1]} radius={8} />}
        <FitShape />
        <MapControls />
      </MapContainer>
      <div className="map-players">
        <div className="map-avatars" aria-hidden="true">
          {PLAYERS.map((player) => (
            <span
              key={player.id}
              className={player.highlighted ? 'map-avatar is-active' : 'map-avatar'}
            >
              {player.letter}
            </span>
          ))}
        </div>
        <p>1 of 5 submitted</p>
      </div>
    </div>
  )
}
