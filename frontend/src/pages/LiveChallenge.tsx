import { useState } from 'react'
import { ClockIcon, FlagIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { BackLink } from '../components/common/BackLink'
import { ChallengeMap } from '../components/Map/ChallengeMap'
import './LiveChallenge.css'

export function LiveChallenge() {
  const [paused, setPaused] = useState(false)

  return (
    <div className="live-stage">
      <section className="live-phone" aria-label="Live challenge">
        <header className="live-header">
          <BackLink pathDestination="/home" pathName="Weekend sketch walk" />
          <div className="live-title-row">
            <h1>Draw a heart</h1>
            <span className={paused ? 'live-rec is-paused' : 'live-rec'}>
              <span className="live-rec-dot" aria-hidden="true" />
              {paused ? 'PAUSE' : 'REC'}
            </span>
          </div>
          <div className="live-meta">
            <p>{paused ? 'Walk paused' : 'Recording your walk'}</p>
            <p>
              <ClockIcon size={16} weight="regular" aria-hidden="true" />
              Ends in 41h 18m
            </p>
          </div>
        </header>

        <ChallengeMap paused={paused} />

        <p className="live-legend">
          <span>Gold:</span> recorded route · Dashed: planned route
        </p>

        <div className="live-stats">
          <article className="live-stat">
            <strong>18:42</strong>
            <span>elapsed</span>
          </article>
          <article className="live-stat">
            <strong>
              1.3<span className="live-stat-rest"> / 2.4 km</span>
            </strong>
            <span>distance</span>
          </article>
          <article className="live-stat">
            <strong className="is-gold">54%</strong>
            <span>heart drawn</span>
          </article>
        </div>

        <div
          className="live-progress"
          role="progressbar"
          aria-valuenow={54}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Heart drawn"
        >
          <div />
        </div>

        <div className="live-actions">
          <button type="button" className="live-pause" onClick={() => setPaused((value) => !value)}>
            {paused ? <PlayIcon size={18} weight="fill" aria-hidden="true" /> : <PauseIcon size={18} weight="fill" aria-hidden="true" />}
            {paused ? 'Continue' : 'Pause'}
          </button>
          <button type="button" className="live-finish">
            <FlagIcon size={18} weight="fill" aria-hidden="true" />
            Finish
          </button>
        </div>
      </section>
    </div>
  )
}
