import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChallengeMap } from './ChallengeMap'

type Handler = () => void

const { fetchStreets, listeners, map } = vi.hoisted(() => {
  const listeners: Record<string, Handler[]> = {}
  const fetchStreets = vi.fn(() => Promise.resolve([]))
  const map = {
    _loaded: false,
    whenReady(callback: Handler) {
      if (this._loaded) callback()
      else this.on('load', callback)
    },
    on(event: string, callback: Handler) {
      listeners[event] = [...(listeners[event] ?? []), callback]
    },
    off(event: string, callback: Handler) {
      listeners[event] = (listeners[event] ?? []).filter((handler) => handler !== callback)
    },
    fire(event: string) {
      for (const callback of [...(listeners[event] ?? [])]) callback()
    },
    getSize: () => ({ x: 320, y: 320 }),
    getZoom: () => 16,
    getBounds: () => ({
      pad: () => ({
        getSouth: () => 47.6,
        getWest: () => -122.4,
        getNorth: () => 47.7,
        getEast: () => -122.3,
      }),
    }),
    dragging: { disable() {}, enable() {} },
    boxZoom: { disable() {}, enable() {} },
    doubleClickZoom: { disable() {}, enable() {} },
    attributionControl: { setPrefix() {} },
    getContainer: () => document.createElement('div'),
    zoomIn() {},
    zoomOut() {},
    setView() {},
  }

  return { fetchStreets, listeners, map }
})

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Polyline: () => null,
  CircleMarker: () => null,
  useMap: () => map,
}))

vi.mock('./streets', () => ({
  fetchStreets: (...args: unknown[]) => fetchStreets(...args),
}))

describe('StreetLayer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    map._loaded = false
    for (const event of Object.keys(listeners)) delete listeners[event]
    fetchStreets.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('removes the ready listener when the map unmounts before it loads', () => {
    const view = render(<ChallengeMap strokes={[]} onStrokesChange={() => undefined} />)

    expect(listeners.load).toHaveLength(1)
    expect(listeners.moveend).toHaveLength(1)
    expect(listeners.resize).toHaveLength(1)

    view.unmount()

    expect(listeners.load ?? []).toHaveLength(0)
    expect(listeners.moveend ?? []).toHaveLength(0)
    expect(listeners.resize ?? []).toHaveLength(0)

    map.fire('load')
    vi.advanceTimersByTime(500)

    expect(fetchStreets).not.toHaveBeenCalled()
  })
})
