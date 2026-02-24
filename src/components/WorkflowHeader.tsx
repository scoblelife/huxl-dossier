import { Link } from '@tanstack/react-router'
import type { Dossier, QualityTier } from '~/types/dossier'

export function WorkflowHeader({ dossier }: { dossier: Dossier }) {
  const statusBadge = getStatusBadge(dossier.state, dossier.current_stage)
  const duration = getDuration(dossier.created_at, dossier.updated_at)

  return (
    <div style={{
      background: '#0c1019',
      borderBottom: '1px solid #1c2640',
      padding: '16px 0',
    }}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        <Link
          to="/"
          style={{
            color: '#7a8aaa',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          ← Back
        </Link>

        <div style={{ width: '1px', height: '16px', background: '#1c2640', display: 'none' }} className="sm:block" />

        <div>
          <span style={{ color: '#7a8aaa', fontSize: '13px', marginRight: '6px' }}>Run</span>
          <code style={{ color: '#00e5ff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
            {dossier.job_id.slice(0, 8)}
          </code>
        </div>

        <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />

        {statusBadge}

        {dossier.tier && (
          <>
            <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />
            <TierBadge tier={dossier.tier} />
          </>
        )}

        <div style={{ width: '1px', height: '16px', background: '#1c2640', display: 'none' }} className="sm:block" />

        <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
          <span style={{ marginRight: '6px' }}>Duration:</span>
          <span style={{ color: '#e0e8f8', fontWeight: 600 }}>{duration}</span>
        </div>

        {dossier.conformance_bundle && (
          <>
            <div style={{ width: '1px', height: '16px', background: '#1c2640', display: 'none' }} className="sm:block" />
            <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
              <span style={{ marginRight: '6px' }}>Cost:</span>
              <span style={{ color: '#00dfa2', fontWeight: 700, fontSize: '14px' }}>
                ${dossier.conformance_bundle.total_cost_usd.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: QualityTier }) {
  const colors: Record<QualityTier, { color: string; bg: string; border: string }> = {
    B: { color: '#7a8aaa', bg: 'rgba(122,138,170,0.15)', border: 'rgba(122,138,170,0.4)' },
    A: { color: '#00e5ff', bg: 'rgba(0,229,255,0.15)', border: 'rgba(0,229,255,0.4)' },
    S: { color: '#ff9500', bg: 'rgba(255,149,0,0.15)', border: 'rgba(255,149,0,0.4)' },
  }
  const c = colors[tier]
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 800,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.05em',
    }}>
      TIER {tier}
    </span>
  )
}

function getStatusBadge(state: string, currentStage: string | null) {
  const styles: Record<string, { bg: string; color: string; border: string; glow?: string }> = {
    Complete: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)' },
    Concierge: { bg: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: 'rgba(0, 229, 255, 0.4)', glow: '0 0 10px rgba(0, 229, 255, 0.2)' },
    Forging: { bg: 'rgba(255, 149, 0, 0.15)', color: '#ff9500', border: 'rgba(255, 149, 0, 0.4)', glow: '0 0 10px rgba(255, 149, 0, 0.2)' },
    Inspecting: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)', glow: '0 0 10px rgba(0, 223, 162, 0.2)' },
    Delivered: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)' },
    Tempering: { bg: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: 'rgba(0, 229, 255, 0.4)', glow: '0 0 10px rgba(0, 229, 255, 0.2)' },
    Nurturing: { bg: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: 'rgba(0, 229, 255, 0.4)' },
    Failed: { bg: 'rgba(255, 56, 56, 0.15)', color: '#ff3838', border: 'rgba(255, 56, 56, 0.4)' },
    Rejected: { bg: 'rgba(255, 56, 56, 0.15)', color: '#ff3838', border: 'rgba(255, 56, 56, 0.4)' },
  }

  const s = styles[state] || { bg: 'rgba(122, 138, 170, 0.15)', color: '#7a8aaa', border: 'rgba(122, 138, 170, 0.4)' }
  const icons: Record<string, string> = {
    Complete: '✓',
    Concierge: '●',
    Forging: '⚡',
    Inspecting: '◉',
    Delivered: '✓',
    Tempering: '●',
    Nurturing: '●',
    Failed: '✕',
    Rejected: '✕',
  }

  const isAnimated = ['Concierge', 'Forging', 'Inspecting', 'Tempering'].includes(state)

  return (
    <span
      className={isAnimated ? 'animate-pulse' : ''}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span>{icons[state] || '○'}</span>
      <span>{state}</span>
    </span>
  )
}

function getDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
