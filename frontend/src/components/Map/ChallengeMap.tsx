import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'

type LatLng = [number, number]

const shape: LatLng[] = [
  [47.6062, -122.3321],
  [47.6072, -122.3321],
  [47.6072, -122.3306],
  [47.6062, -122.3306],
  [47.6062, -122.3321],
]

const preview: LatLng[] = [
  [47.6062, -122.3321],
  [47.6065, -122.3321],
  [47.6068, -122.3321],
  [47.6068, -122.3316],
  [47.6068, -122.3311],
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

export function ChallengeMap() {
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
        {preview.slice(1).map((point, index) => (
          <Polyline
            key={index}
            positions={[preview[index], point]}
            pathOptions={{ color: colorForSegment(preview[index], point), weight: 5 }}
          />
        ))}
        <CircleMarker center={preview[preview.length - 1]} radius={8} />
        <FitShape />
        <MapControls />
      </MapContainer>
    </div>
  )
}
