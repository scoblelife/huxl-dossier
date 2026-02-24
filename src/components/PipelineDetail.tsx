import { useState } from 'react'
import type { Dossier, StageId, Actor } from '~/types/dossier'
import { STAGES_ORDERED, STAGE_ACTOR } from '~/types/dossier'

const STAGE_LABELS: Record<StageId, string> = {
  Prospecting: 'Prospecting',
  Qualifying: 'Qualifying',
  Discovering: 'Discovering',
  Scoping: 'Scoping',
  Forging: 'Forging',
  Delivering: 'Delivering',
  Tempering: 'Tempering',
  Nurturing: 'Nurturing',
}

const ACTOR_META: Record<Actor, { label: string; color: string }> = {
  Concierge: { label: 'CONCIERGE', color: '#00e5ff' },
  Factory: { label: 'FACTORY', color: '#ff9500' },
  Inspector: { label: 'INSPECTOR', color: '#00dfa2' },
}

interface StageSummary {
  stage: StageId
  actor: Actor
  attempts: number
  status: 'complete' | 'failed' | 'running' | 'pending'
  duration: number
  tokens: { in: number; out: number }
  cost: number
  timeline: Dossier['pipeline_timeline']
}

export function PipelineDetail({ dossier }: { dossier: Dossier }) {
  const summaries = buildStageSummaries(dossier)
  const grouped = groupByActor(summaries)

  return (
    <div>
      <h3
        style={{
          color: '#7a8aaa',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          marginBottom: '24px',
          textTransform: 'uppercase',
        }}
      >
        LIFECYCLE DETAIL
      </h3>

      <div className="space-y-8">
        {grouped.map(({ actor, stages }) => {
          const meta = ACTOR_META[actor]
          return (
            <div key={actor}>
              <div
                style={{
                  fontSize: '11px',
                  color: meta.color,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                ▸ {meta.label}
              </div>
              <div className="space-y-3">
                {stages.map((summary) => (
                  <StageSection key={summary.stage} summary={summary} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StageSection({ summary }: { summary: StageSummary }) {
  const [expanded, setExpanded] = useState(summary.status === 'running' || summary.status === 'failed')

  const statusConfig = {
    complete: { icon: '✓', color: '#00dfa2', bg: 'rgba(0, 223, 162, 0.1)', border: 'rgba(0, 223, 162, 0.3)' },
    failed: { icon: '✕', color: '#ff3838', bg: 'rgba(255, 56, 56, 0.1)', border: 'rgba(255, 56, 56, 0.3)' },
    running: { icon: '●', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.1)', border: 'rgba(0, 229, 255, 0.3)' },
    pending: { icon: '○', color: '#7a8aaa', bg: 'rgba(122, 138, 170, 0.05)', border: 'rgba(122, 138, 170, 0.2)' },
  }

  const config = statusConfig[summary.status]

  return (
    <div
      style={{
        background: '#0c1019',
        border: `1px solid ${config.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: config.bg,
          border: 'none',
          cursor: 'pointer',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-4">
          <span style={{ fontSize: '20px', color: config.color }}>{config.icon}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e0e8f8', marginBottom: '4px' }}>
              {STAGE_LABELS[summary.stage]}
            </div>
            <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
              {summary.attempts > 1 && `${summary.attempts} attempts · `}
              {formatDuration(summary.duration)}
              {summary.tokens.in > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  · {(summary.tokens.in / 1000).toFixed(1)}K → {(summary.tokens.out / 1000).toFixed(1)}K tokens
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {summary.cost > 0 && (
            <div style={{ fontSize: '14px', color: '#00dfa2', fontWeight: 700 }}>
              ${summary.cost.toFixed(4)}
            </div>
          )}
          <span style={{ color: '#7a8aaa', fontSize: '16px' }}>
            {expanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '20px', borderTop: '1px solid #1c2640' }}>
          <div className="space-y-6">
            {summary.timeline.map((entry, idx) => (
              <div key={idx}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(28, 38, 64, 0.5)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Attempt {entry.attempt}
                  </span>
                  {entry.result && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: entry.result === 'Ok' ? 'rgba(0, 223, 162, 0.2)' : 'rgba(255, 149, 0, 0.2)',
                        color: entry.result === 'Ok' ? '#00dfa2' : '#ff9500',
                      }}
                    >
                      {entry.result}
                    </span>
                  )}
                  <span style={{ fontSize: '13px', color: '#7a8aaa', marginLeft: 'auto' }}>
                    {entry.model}
                  </span>
                </div>

                {entry.context_additions.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Context In ({entry.context_additions.length})
                    </div>
                    <div className="space-y-2">
                      {entry.context_additions.map((ctx, ctxIdx) => (
                        <div
                          key={ctxIdx}
                          style={{
                            background: '#06080e',
                            border: '1px solid #1c2640',
                            borderRadius: '6px',
                            padding: '12px',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#ff9500', fontWeight: 600, marginBottom: '6px' }}>
                            {ctx.kind}
                          </div>
                          <div style={{ fontSize: '13px', color: '#e0e8f8', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                            {ctx.content.slice(0, 500)}
                            {ctx.content.length > 500 && '...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.artifact_summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Artifact Out
                    </div>
                    <div style={{ background: '#06080e', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '6px', padding: '12px', fontSize: '14px', color: '#e0e8f8', lineHeight: '1.7' }}>
                      {entry.artifact_summary}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  {entry.ended_at && (
                    <div>
                      <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>Duration</div>
                      <div style={{ fontSize: '13px', color: '#e0e8f8', fontWeight: 600 }}>
                        {formatDuration(new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime())}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>Tokens</div>
                    <div style={{ fontSize: '13px', color: '#e0e8f8', fontWeight: 600 }}>
                      {entry.tokens_in.toLocaleString()} → {entry.tokens_out.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>Cost</div>
                    <div style={{ fontSize: '13px', color: '#00dfa2', fontWeight: 700 }}>
                      ${entry.cost_usd.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function groupByActor(summaries: StageSummary[]): Array<{ actor: Actor; stages: StageSummary[] }> {
  const order: Actor[] = ['Concierge', 'Factory', 'Inspector']
  const groups: Array<{ actor: Actor; stages: StageSummary[] }> = []

  for (const actor of order) {
    const stages = summaries.filter((s) => s.actor === actor)
    if (stages.length > 0) {
      groups.push({ actor, stages })
    }
  }

  // Post-delivery stages (Tempering, Nurturing) under Concierge actor but show separately
  return groups
}

function buildStageSummaries(dossier: Dossier): StageSummary[] {
  return STAGES_ORDERED.map((stage) => {
    const entries = dossier.pipeline_timeline.filter((t) => t.stage === stage)
    const attempts = entries.length
    const completed = entries.filter((e) => e.ended_at && e.result === 'Ok')
    const failed = entries.filter((e) => e.ended_at && (e.result === 'Rejected' || e.result === 'GateFail'))
    const running = entries.filter((e) => !e.ended_at)

    let status: StageSummary['status'] = 'pending'
    if (running.length > 0) status = 'running'
    else if (completed.length > 0) status = 'complete'
    else if (failed.length > 0) status = 'failed'

    const totalDuration = entries.reduce((sum, e) => {
      if (e.ended_at) return sum + (new Date(e.ended_at).getTime() - new Date(e.started_at).getTime())
      return sum
    }, 0)

    return {
      stage,
      actor: STAGE_ACTOR[stage],
      attempts,
      status,
      duration: totalDuration,
      tokens: {
        in: entries.reduce((s, e) => s + e.tokens_in, 0),
        out: entries.reduce((s, e) => s + e.tokens_out, 0),
      },
      cost: entries.reduce((s, e) => s + e.cost_usd, 0),
      timeline: entries,
    }
  })
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
