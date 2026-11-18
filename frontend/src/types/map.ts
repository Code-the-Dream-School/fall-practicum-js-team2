export type LatLng = [number, number]

export type Street = {
  id: string
  line: LatLng[]
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}
