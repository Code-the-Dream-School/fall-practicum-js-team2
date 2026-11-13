import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/common/BackLink'
import { ChallengeMap } from '../components/Map/ChallengeMap'
import './PlanRoute.css'

export function PlanRoute() {
  const navigate = useNavigate()

  return (
    <div className="plan-stage">
      <section className="plan-phone" aria-label="Plan your route">
        <header className="plan-header">
          <BackLink pathDestination="/home" pathName="Weekend sketch walk" />
          <div className="plan-title-row">
            <h1>Plan your route</h1>
            <span className="plan-pill">Heart</span>
          </div>
          <p className="plan-meta">2.4 km · about 35 min</p>
        </header>

        <ChallengeMap />

        <p className="plan-legend">
          <span>Gold:</span> recorded route · Dashed: planned route
        </p>

        <div className="plan-stats">
          <article className="plan-stat">
            <strong>Heart</strong>
            <span>shape</span>
          </article>
          <article className="plan-stat">
            <strong>2.4 km</strong>
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
