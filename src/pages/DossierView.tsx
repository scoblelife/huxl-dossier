import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { Dossier, StageId } from '~/types/dossier'
import { StateMachine } from '~/components/StateMachine'
import { HuxlDslViz } from '~/components/HuxlDslViz'
import { StageModal } from '~/components/StageModal'
import { ValidationResults } from '~/components/ValidationResults'
import { Artifacts } from '~/components/Artifacts'

export function DossierView() {
  const params = useParams({ strict: false }) as { jobId: string }
  const jobId = params.jobId
  const [selectedStage, setSelectedStage] = useState<StageId | null>(null)

  const { data: dossier, isLoading } = useQuery<Dossier>({
    queryKey: ['dossier', jobId],
    queryFn: async () => {
      const ids = ['sample', 'complete', 'kith-build']
      const url = ids.includes(jobId)
        ? `${import.meta.env.BASE_URL}sample/${jobId}.json`
        : `/api/dossier/${jobId}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch dossier')
      const data = await response.json()
      // Normalize legacy fields
      if (data.current_pass !== undefined && data.current_stage === undefined) {
        data.current_stage = data.current_pass
      }
      if (!data.gate_events) {
        data.gate_events = []
      }
      if (data.huxl_dsl === undefined) data.huxl_dsl = null
      if (data.concierge_prompt === undefined) data.concierge_prompt = null
      // Normalize pipeline_timeline: old "pass" field → "stage"
      if (data.pipeline_timeline) {
        for (const entry of data.pipeline_timeline) {
          if (entry.pass && !entry.stage) {
            entry.stage = entry.pass
          }
        }
      }
      return data
    },
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#06080e' }}>
        <div style={{ color: '#00e5ff', fontSize: '14px' }} className="animate-pulse font-mono">
          ▸ LOADING DOSSIER...
        </div>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#06080e' }}>
        <div style={{ color: '#ff3838', fontSize: '14px' }} className="font-mono">
          ✕ DOSSIER NOT FOUND
        </div>
      </div>
    )
  }

  const handleStageClick = (stage: StageId) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
  }

  return (
    <div className="min-h-screen w-full" style={{ background: '#06080e' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#06080e',
        borderBottom: '1px solid #1c2640',
      }}>
        <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
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

          <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />

          <div>
            <span style={{ color: '#7a8aaa', fontSize: '13px', marginRight: '6px' }}>Run</span>
            <code style={{
              color: '#00e5ff',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {dossier.job_id.slice(0, 8)}
            </code>
          </div>

          <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />

          {getStatusBadge(dossier.state, dossier.current_stage)}

          <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />

          <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
            <span style={{ marginRight: '6px' }}>Duration:</span>
            <span style={{ color: '#e0e8f8', fontWeight: 600 }}>
              {getDuration(dossier.created_at, dossier.updated_at)}
            </span>
          </div>

          {dossier.conformance_bundle && (
            <>
              <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />
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

      {/* Content */}
      <div
        style={{
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
        className="sm:px-8"
      >
        <div style={{ paddingTop: '32px', paddingBottom: '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Customer Intent (brief) */}
          <div>
            <h3 style={{ color: '#7a8aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>
              CUSTOMER INTENT
            </h3>
            <blockquote style={{
              borderLeft: '3px solid #00e5ff',
              paddingLeft: '20px',
              color: '#e0e8f8',
              fontSize: '15px',
              lineHeight: '1.7',
              fontStyle: 'italic',
              margin: 0,
            }}>
              "{dossier.intent.raw}"
            </blockquote>
          </div>

          {/* Pipeline overview — always visible, clickable stages */}
          <div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#546080', textAlign: 'center' }}>
              Click a stage to view details
            </div>
            <StateMachine
              dossier={dossier}
              onStageClick={handleStageClick}
              selectedStage={selectedStage}
            />
          </div>

          {/* huxl-dsl visualization + constraint profile */}
          <HuxlDslViz dossier={dossier} />

          {/* Validation results */}
          {dossier.validation_results.length > 0 && (
            <ValidationResults dossier={dossier} />
          )}

          {/* Artifacts */}
          {(dossier.artifacts.repo_url || dossier.artifacts.files.length > 0) && (
            <Artifacts dossier={dossier} />
          )}
        </div>
      </div>

      {/* Stage detail modal */}
      {selectedStage && (
        <StageModal
          dossier={dossier}
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
          onNavigate={(stage) => setSelectedStage(stage)}
        />
      )}
    </div>
  )
}

function getStatusBadge(state: string, currentStage: string | null) {
  const styles: Record<string, { bg: string; color: string; border: string; glow?: string }> = {
    Complete: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)' },
    Concierge: { bg: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: 'rgba(0, 229, 255, 0.4)', glow: '0 0 10px rgba(0, 229, 255, 0.2)' },
    Forging: { bg: 'rgba(255, 149, 0, 0.15)', color: '#ff9500', border: 'rgba(255, 149, 0, 0.4)', glow: '0 0 10px rgba(255, 149, 0, 0.2)' },
    Inspecting: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)', glow: '0 0 10px rgba(0, 223, 162, 0.2)' },
    Failed: { bg: 'rgba(255, 56, 56, 0.15)', color: '#ff3838', border: 'rgba(255, 56, 56, 0.4)' },
    Rejected: { bg: 'rgba(255, 56, 56, 0.15)', color: '#ff3838', border: 'rgba(255, 56, 56, 0.4)' },
  }

  const s = styles[state] || { bg: 'rgba(122, 138, 170, 0.15)', color: '#7a8aaa', border: 'rgba(122, 138, 170, 0.4)' }
  const icons: Record<string, string> = {
    Complete: '✓',
    Concierge: '●',
    Forging: '⚡',
    Inspecting: '◉',
    Failed: '✕',
    Rejected: '✕',
  }

  return (
    <span
      className={['Concierge', 'Forging', 'Inspecting'].includes(state) ? 'animate-pulse' : ''}
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
