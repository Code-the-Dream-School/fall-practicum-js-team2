import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/common/BackLink'
import { ChallengeMap, routeLengthKm, type LatLng } from '../components/Map/ChallengeMap'
import './PlanRoute.css'

const MILES_PER_KM = 0.621371

function formatMiles(kilometers: number) {
  return `${(kilometers * MILES_PER_KM).toFixed(1)} mi`
}

function formatRoute(kilometers: number) {
  const minutes = Math.max(1, Math.round((kilometers / 5) * 60))
  return `${formatMiles(kilometers)} · about ${minutes} min`
}

export function PlanRoute() {
  const navigate = useNavigate()
  const [strokes, setStrokes] = useState<LatLng[][]>([])
  const hasLine = strokes.some((stroke) => stroke.length >= 2)
  const routeKm = hasLine ? routeLengthKm(strokes) : null

  const undoStroke = () => {
    setStrokes((current) => current.slice(0, -1))
  }

  const resetStrokes = () => {
    setStrokes([])
  }

  return (
    <div className="plan-stage">
      <section className="plan-phone" aria-label="Plan your route">
        <header className="plan-header">
          <BackLink pathDestination="/home" pathName="Weekend sketch walk" />
          <div className="plan-title-row">
            <h1>Plan your route</h1>
            <span className="plan-pill">Heart</span>
          </div>
          <p className="plan-meta">{routeKm == null ? 'Draw the route on the map' : formatRoute(routeKm)}</p>
        </header>

        <ChallengeMap strokes={strokes} onStrokesChange={setStrokes} />

        <div className="plan-sketch-actions">
          <button type="button" onClick={undoStroke} disabled={strokes.length === 0}>
            Undo
          </button>
          <button type="button" onClick={resetStrokes} disabled={strokes.length === 0}>
            Reset
          </button>
        </div>

        <p className="plan-legend">
          <span>Gold:</span> planned route
        </p>

        <div className="plan-stats">
          <article className="plan-stat">
            <strong>Heart</strong>
            <span>shape</span>
          </article>
          <article className="plan-stat">
            <strong>{routeKm == null ? '—' : formatMiles(routeKm)}</strong>
            <span>size</span>
          </article>
          <article className="plan-stat">
            <strong>Your location</strong>
            <span>start</span>
          </article>
        </div>

        <button type="button" className="plan-start" onClick={() => navigate('/challenge-map')}>
          Start walk
        </button>
      </section>
    </div>
  )
}
