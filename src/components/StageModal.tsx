import { useEffect, useCallback } from 'react'
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

export function StageModal({
  dossier,
  stage,
  onClose,
  onNavigate,
}: {
  dossier: Dossier
  stage: StageId
  onClose: () => void
  onNavigate: (stage: StageId) => void
}) {
  const stageIdx = STAGES_ORDERED.indexOf(stage)
  const hasPrev = stageIdx > 0
  const hasNext = stageIdx < STAGES_ORDERED.length - 1

  const navigatePrev = useCallback(() => {
    if (hasPrev) onNavigate(STAGES_ORDERED[stageIdx - 1])
  }, [hasPrev, stageIdx, onNavigate])

  const navigateNext = useCallback(() => {
    if (hasNext) onNavigate(STAGES_ORDERED[stageIdx + 1])
  }, [hasNext, stageIdx, onNavigate])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigatePrev()
      if (e.key === 'ArrowRight') navigateNext()
    },
    [onClose, navigatePrev, navigateNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const entries = dossier.pipeline_timeline.filter((t) => t.stage === stage)
  const actor = STAGE_ACTOR[stage]
  const meta = ACTOR_META[actor]
  const gateEvents = (dossier.gate_events || []).filter((g) => {
    if (stage === 'Scoping') return g.gate === 'ConciergeToFactory'
    if (stage === 'Delivering') return g.gate === 'FactoryToCustomer'
    return false
  })

  const totalTokensIn = entries.reduce((s, e) => s + e.tokens_in, 0)
  const totalTokensOut = entries.reduce((s, e) => s + e.tokens_out, 0)
  const totalCost = entries.reduce((s, e) => s + e.cost_usd, 0)
  const totalDuration = entries.reduce((sum, e) => {
    if (e.ended_at) return sum + (new Date(e.ended_at).getTime() - new Date(e.started_at).getTime())
    return sum
  }, 0)

  const hasData = entries.length > 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(2, 4, 8, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'stageModalFadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes stageModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes stageModalSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Left arrow */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); navigatePrev() }}
          style={{
            position: 'fixed',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(12, 16, 25, 0.9)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            color: '#00e5ff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
            transition: 'all 0.15s ease',
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.6)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(12, 16, 25, 0.9)'
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)'
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.1)'
          }}
        >
          ←
        </button>
      )}

      {/* Right arrow */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); navigateNext() }}
          style={{
            position: 'fixed',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(12, 16, 25, 0.9)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            color: '#00e5ff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
            transition: 'all 0.15s ease',
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.6)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(12, 16, 25, 0.9)'
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)'
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.1)'
          }}
        >
          →
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#0c1019',
          border: `1px solid ${meta.color}40`,
          borderRadius: '12px',
          boxShadow: `0 0 40px ${meta.color}15, 0 24px 48px rgba(0,0,0,0.6)`,
          animation: 'stageModalSlideUp 0.25s ease-out',
          margin: '16px',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: `1px solid ${meta.color}30`,
            background: `linear-gradient(to right, ${meta.color}08, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(12, 16, 25, 0.95)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: meta.color, fontWeight: 700, letterSpacing: '0.12em', marginBottom: '6px', textTransform: 'uppercase' }}>
              ▸ {meta.label} · STAGE {stageIdx + 1} OF {STAGES_ORDERED.length}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e0e8f8' }}>
              {STAGE_LABELS[stage]}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(122, 138, 170, 0.1)',
              border: '1px solid rgba(122, 138, 170, 0.3)',
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#7a8aaa',
              fontSize: '18px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 56, 56, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(255, 56, 56, 0.4)'
              e.currentTarget.style.color = '#ff3838'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(122, 138, 170, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(122, 138, 170, 0.3)'
              e.currentTarget.style.color = '#7a8aaa'
            }}
          >
            ✕
          </button>
        </div>

        {/* Summary stats bar */}
        {hasData && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: '#1c2640',
              borderBottom: '1px solid #1c2640',
            }}
          >
            {[
              { label: 'Attempts', value: String(entries.length), color: '#e0e8f8' },
              { label: 'Duration', value: formatDuration(totalDuration), color: '#e0e8f8' },
              { label: 'Tokens', value: `${(totalTokensIn / 1000).toFixed(1)}K → ${(totalTokensOut / 1000).toFixed(1)}K`, color: '#e0e8f8' },
              { label: 'Cost', value: `$${totalCost.toFixed(4)}`, color: '#00dfa2' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: '#0c1019', padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '15px', color: stat.color, fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {!hasData ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#546080', fontSize: '14px' }}>
              This stage has not started yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {entries.map((entry, idx) => {
                const resultColor =
                  entry.result === 'Ok' ? '#00dfa2' :
                  entry.result === 'Rejected' || entry.result === 'GateFail' ? '#ff3838' :
                  entry.result === 'Retry' ? '#ff9500' :
                  '#7a8aaa'

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#06080e',
                      border: '1px solid #1c2640',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Attempt header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderBottom: '1px solid rgba(28, 38, 64, 0.5)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                              background: `${resultColor}20`,
                              color: resultColor,
                            }}
                          >
                            {entry.result}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#7a8aaa', fontFamily: 'monospace' }}>
                        {entry.model}
                      </span>
                    </div>

                    <div style={{ padding: '20px' }}>
                      {/* Context additions */}
                      {entry.context_additions.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Context In ({entry.context_additions.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {entry.context_additions.map((ctx, ctxIdx) => (
                              <div
                                key={ctxIdx}
                                style={{
                                  background: '#0c1019',
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

                      {/* Artifact */}
                      {entry.artifact_summary && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Artifact Out
                          </div>
                          <div style={{
                            background: '#0c1019',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                            borderRadius: '6px',
                            padding: '12px',
                            fontSize: '14px',
                            color: '#e0e8f8',
                            lineHeight: '1.7',
                          }}>
                            {entry.artifact_summary}
                          </div>
                        </div>
                      )}

                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
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
                  </div>
                )
              })}

              {/* Gate events */}
              {gateEvents.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#ff9500', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase' }}>
                    ⬦ Gate Events
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {gateEvents.map((g, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#06080e',
                          border: `1px solid ${g.result === 'Pass' ? 'rgba(0, 223, 162, 0.3)' : 'rgba(255, 56, 56, 0.3)'}`,
                          borderRadius: '6px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span style={{ color: g.result === 'Pass' ? '#00dfa2' : '#ff3838', fontWeight: 700 }}>
                          {g.result === 'Pass' ? '✓' : '✕'}
                        </span>
                        <div>
                          <div style={{ fontSize: '13px', color: '#e0e8f8', fontWeight: 600 }}>{g.gate}</div>
                          <div style={{ fontSize: '12px', color: '#7a8aaa', marginTop: '2px' }}>{g.summary}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
