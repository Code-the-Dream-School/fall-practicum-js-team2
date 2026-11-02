import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer } from 'react-leaflet'

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

function colorForSegment(a: LatLng, b: LatLng) {
  const up = b[0] - a[0]
  const right = b[1] - a[1]
  if (Math.abs(up) > Math.abs(right)) return up > 0 ? '#2a9d8f' : '#e76f51'
  return right > 0 ? '#e9c46a' : '#264653'
}

export function ChallengeMap() {
  const [path, setPath] = useState<LatLng[]>([])

  useEffect(() => {
    let index = 0
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
  }, [])

  return (
    <MapContainer center={shape[0]} zoom={16} style={{ height: '70vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Polyline positions={shape} pathOptions={{ color: '#333', dashArray: '6 8' }} />
      {path.slice(1).map((point, index) => (
        <Polyline
          key={index}
          positions={[path[index], point]}
          pathOptions={{ color: colorForSegment(path[index], point) }}
        />
      ))}
      {path.length > 0 && <CircleMarker center={path[path.length - 1]} radius={8} />}
    </MapContainer>
  )
}