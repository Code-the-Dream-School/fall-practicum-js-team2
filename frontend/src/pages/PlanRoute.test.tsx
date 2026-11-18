import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LatLng } from '../types/map'
import { PlanRoute } from './PlanRoute'

vi.mock('../components/Map/ChallengeMap', () => ({
  ChallengeMap: ({
    strokes,
    onStrokesChange,
  }: {
    strokes: LatLng[][]
    onStrokesChange: (strokes: LatLng[][]) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onStrokesChange([
          ...strokes,
          [
            [47.6062, -122.3321],
            [47.6102, -122.3321],
          ],
        ])
      }
    >
      Add stroke
    </button>
  ),
}))

function renderPlanRoute() {
  return render(
    <MemoryRouter initialEntries={['/plan-route']}>
      <Routes>
        <Route path="/plan-route" element={<PlanRoute />} />
        <Route path="/challenges" element={<h1>Challenges</h1>} />
        <Route path="/challenge-map" element={<h1>Challenge map</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

describe('PlanRoute', () => {
  it('shows the word and the sketch prompt', () => {
    renderPlanRoute()

    expect(screen.getByRole('heading', { name: 'Your word: HEART' })).toBeTruthy()
    expect(screen.getByText('Sketch your route before you head out.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveProperty('disabled', true)
  })

  it('links back to the challenge list', () => {
    renderPlanRoute()

    fireEvent.click(screen.getByRole('link', { name: 'Join a Challenge' }))

    expect(screen.getByRole('heading', { name: 'Challenges' })).toBeTruthy()
  })

  it('starts the walk from the planned route', () => {
    renderPlanRoute()

    fireEvent.click(screen.getByRole('button', { name: 'Start walk' }))

    expect(screen.getByRole('heading', { name: 'Challenge map' })).toBeTruthy()
  })

  it('shows distance and time from the sketched strokes', () => {
    renderPlanRoute()

    expect(screen.getByText('Estimated distance')).toBeTruthy()
    expect(screen.getByText('—')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Add stroke' }))

    const oneStrokeTime = screen.getByText(/About \d+ min/).textContent
    const oneStrokeDistance = screen.getByText(/\d+\.\d mi/).textContent
    expect(screen.queryByText('Estimated distance')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Add stroke' }))

    expect(screen.getByText(/About \d+ min/).textContent).not.toBe(oneStrokeTime)
    expect(screen.getByText(/\d+\.\d mi/).textContent).not.toBe(oneStrokeDistance)
  })

  it('undoes the last stroke and resets the route', () => {
    renderPlanRoute()

    fireEvent.click(screen.getByRole('button', { name: 'Add stroke' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add stroke' }))
    const twoStrokeDistance = screen.getByText(/\d+\.\d mi/).textContent

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByText(/\d+\.\d mi/).textContent).not.toBe(twoStrokeDistance)
    expect(screen.getByText(/About \d+ min/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByText('Estimated distance')).toBeTruthy()
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveProperty('disabled', true)
  })
})
