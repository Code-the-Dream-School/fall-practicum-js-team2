import { describe, expect, it } from 'vitest'
import type { LatLng, Street } from '../types/map'
import { distanceMeters, routeLengthKm, segmentStaysOnStreets } from './geoUtils'

function street(line: LatLng[]): Street {
  const latitudes = line.map((point) => point[0])
  const longitudes = line.map((point) => point[1])

  return {
    id: 'main',
    line,
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
  }
}

const road = street([
  [47.6, -122.33],
  [47.6, -122.329],
])

describe('distanceMeters', () => {
  it('is zero for the same point', () => {
    expect(distanceMeters([47.6, -122.33], [47.6, -122.33])).toBe(0)
  })

  it('measures about 111 meters for 0.001 degrees of latitude', () => {
    expect(distanceMeters([47.6, -122.33], [47.601, -122.33])).toBeCloseTo(111.32, 0)
  })
})

describe('routeLengthKm', () => {
  it('adds the length of every stroke', () => {
    const first: LatLng[] = [
      [47.6, -122.33],
      [47.601, -122.33],
    ]
    const second: LatLng[] = [
      [47.601, -122.33],
      [47.601, -122.329],
    ]

    const total = routeLengthKm([first, second])

    expect(total).toBeGreaterThan(routeLengthKm([first]))
    expect(total).toBeCloseTo(routeLengthKm([first]) + routeLengthKm([second]), 5)
  })

  it('ignores a stroke that is only a point', () => {
    expect(routeLengthKm([[[47.6, -122.33]]])).toBe(0)
  })
})

describe('segmentStaysOnStreets', () => {
  it('accepts a segment that follows the street', () => {
    expect(segmentStaysOnStreets([47.6, -122.33], [47.6, -122.3295], [road])).toBe(true)
  })

  it('rejects a segment that leaves the street', () => {
    expect(segmentStaysOnStreets([47.6002, -122.33], [47.6002, -122.3295], [road])).toBe(false)
  })
})
