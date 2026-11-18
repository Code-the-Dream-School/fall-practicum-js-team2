import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/common/BackLink'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { ChallengeMap } from '../components/Map/ChallengeMap'
import type { LatLng } from '../types/map'
import { routeLengthKm } from '../utils/geoUtils'
import './PlanRoute.css'

const MILES_PER_KM = 0.621371

function formatMiles(kilometers: number) {
  return `${(kilometers * MILES_PER_KM).toFixed(1)} mi`
}

function formatMinutes(kilometers: number) {
  const minutes = Math.max(1, Math.round((kilometers / 5) * 60))
  return `About ${minutes} min`
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
        <div className="plan-header">
          <BackLink pathDestination="/challenges" pathName="Join a Challenge" />
          <PageHeader title="Your word: HEART" subtitle="Sketch your route before you head out." />
        </div>

        <ChallengeMap strokes={strokes} onStrokesChange={setStrokes} />

        <div className="plan-sketch-actions">
          <Button onClick={undoStroke} disabled={strokes.length === 0}>
            Undo
          </Button>
          <Button onClick={resetStrokes} disabled={strokes.length === 0}>
            Reset
          </Button>
        </div>

        <article className="plan-estimate">
          <div>
            <h2>Planned route</h2>
            <p>{routeKm == null ? 'Estimated distance' : formatMinutes(routeKm)}</p>
          </div>
          <strong>{routeKm == null ? '—' : formatMiles(routeKm)}</strong>
        </article>

        <Button className="plan-start" onClick={() => navigate('/challenge-map')}>
          Start walk
        </Button>
      </section>
    </div>
  )
}
