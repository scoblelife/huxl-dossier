import { useState } from 'react'
import type { Dossier, PassId } from '~/types/dossier'

const PASS_LABELS: Record<PassId, string> = {
  Groom: 'Groom',
  IntentDenoise: 'Intent Denoise',
  ArchitectureDenoise: 'Architecture Denoise',
  ImplementationDenoise: 'Implementation Denoise',
  IntegrationDenoise: 'Integration Denoise',
  IntentVerification: 'Intent Verification',
}

interface PassSummary {
  pass: PassId
  attempts: number
  status: 'complete' | 'failed' | 'running' | 'pending'
  duration: number
  tokens: { in: number; out: number }
  cost: number
  timeline: Dossier['pipeline_timeline']
  backpressureEvents: Dossier['backpressure_events']
}

export function PipelineDetail({ dossier }: { dossier: Dossier }) {
  const passSummaries = buildPassSummaries(dossier)
  
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
        PIPELINE DETAIL
      </h3>

      <div className="space-y-3">
        {passSummaries.map((summary) => (
          <PassSection key={summary.pass} summary={summary} />
        ))}
      </div>
    </div>
  )
}

function PassSection({ summary }: { summary: PassSummary }) {
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
      {/* Header (always visible) */}
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
              {PASS_LABELS[summary.pass]}
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

      {/* Expanded content */}
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
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#7a8aaa',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Attempt {entry.attempt}
                  </span>
                  {entry.result && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          entry.result === 'Ok'
                            ? 'rgba(0, 223, 162, 0.2)'
                            : 'rgba(255, 149, 0, 0.2)',
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

                {/* Context In */}
                {entry.context_additions.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#7a8aaa',
                        fontWeight: 600,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
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
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#ff9500',
                              fontWeight: 600,
                              marginBottom: '6px',
                            }}
                          >
                            {ctx.kind}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#e0e8f8',
                              lineHeight: '1.6',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '200px',
                              overflowY: 'auto',
                            }}
                          >
                            {ctx.content.slice(0, 500)}
                            {ctx.content.length > 500 && '...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artifact Out */}
                {entry.artifact_summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#7a8aaa',
                        fontWeight: 600,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Artifact Out
                    </div>
                    <div
                      style={{
                        background: '#06080e',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '14px',
                        color: '#e0e8f8',
                        lineHeight: '1.7',
                      }}
                    >
                      {entry.artifact_summary}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    marginTop: '12px',
                  }}
                >
                  {entry.ended_at && (
                    <div>
                      <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>
                        Duration
                      </div>
                      <div style={{ fontSize: '13px', color: '#e0e8f8', fontWeight: 600 }}>
                        {formatDuration(
                          new Date(entry.ended_at).getTime() -
                            new Date(entry.started_at).getTime()
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>
                      Tokens
                    </div>
                    <div style={{ fontSize: '13px', color: '#e0e8f8', fontWeight: 600 }}>
                      {entry.tokens_in.toLocaleString()} → {entry.tokens_out.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '11px', color: '#7a8aaa', marginBottom: '4px' }}>
                      Cost
                    </div>
                    <div style={{ fontSize: '13px', color: '#00dfa2', fontWeight: 700 }}>
                      ${entry.cost_usd.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Backpressure events for this pass */}
            {summary.backpressureEvents.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 56, 56, 0.1)',
                  border: '1px solid rgba(255, 56, 56, 0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#ff3838',
                    fontWeight: 700,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ⚡ Backpressure Events
                </div>
                {summary.backpressureEvents.map((bp, bpIdx) => (
                  <div
                    key={bpIdx}
                    style={{
                      fontSize: '13px',
                      color: '#e0e8f8',
                      marginBottom: '8px',
                      lineHeight: '1.6',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#ff9500', marginBottom: '4px' }}>
                      {bp.from} → {bp.to}
                      {bp.to === 'Customer' && (
                        <span
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            background: 'rgba(255, 56, 56, 0.3)',
                            borderRadius: '4px',
                            fontSize: '10px',
                          }}
                        >
                          BOUNDARY BREACH
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#7a8aaa', fontSize: '12px' }}>
                      {bp.failure_summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function buildPassSummaries(dossier: Dossier): PassSummary[] {
  const allPasses: PassId[] = [
    'Groom',
    'IntentDenoise',
    'ArchitectureDenoise',
    'ImplementationDenoise',
    'IntegrationDenoise',
    'IntentVerification',
  ]

  return allPasses.map((pass) => {
    const entries = dossier.pipeline_timeline.filter((t) => t.pass === pass)
    const attempts = entries.length
    const completedEntries = entries.filter((e) => e.ended_at && e.result === 'Ok')
    const failedEntries = entries.filter(
      (e) => e.ended_at && (e.result === 'Backpressure' || e.result === 'Retry')
    )
    const runningEntries = entries.filter((e) => !e.ended_at)

    let status: PassSummary['status'] = 'pending'
    if (runningEntries.length > 0) status = 'running'
    else if (completedEntries.length > 0) status = 'complete'
    else if (failedEntries.length > 0) status = 'failed'

    const totalDuration = entries.reduce((sum, e) => {
      if (e.ended_at) {
        return sum + (new Date(e.ended_at).getTime() - new Date(e.started_at).getTime())
      }
      return sum
    }, 0)

    const totalTokensIn = entries.reduce((sum, e) => sum + e.tokens_in, 0)
    const totalTokensOut = entries.reduce((sum, e) => sum + e.tokens_out, 0)
    const totalCost = entries.reduce((sum, e) => sum + e.cost_usd, 0)

    const backpressureEvents = dossier.backpressure_events.filter((bp) => bp.from === pass)

    return {
      pass,
      attempts,
      status,
      duration: totalDuration,
      tokens: { in: totalTokensIn, out: totalTokensOut },
      cost: totalCost,
      timeline: entries,
      backpressureEvents,
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
