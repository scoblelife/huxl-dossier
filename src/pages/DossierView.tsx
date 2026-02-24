import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { Dossier } from '~/types/dossier'
import { BeforeAfterCard } from '~/components/BeforeAfterCard'
import { StateMachine } from '~/components/StateMachine'
import { PipelineDetail } from '~/components/PipelineDetail'
import { ValidationResults } from '~/components/ValidationResults'
import { Artifacts } from '~/components/Artifacts'

type TabType = 'summary' | 'history' | 'validation' | 'artifacts'

export function DossierView() {
  const params = useParams({ strict: false }) as { jobId: string }
  const jobId = params.jobId
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  const { data: dossier, isLoading } = useQuery<Dossier>({
    queryKey: ['dossier', jobId],
    queryFn: async () => {
      const ids = ['sample', 'complete', 'kith-build']
      const url = ids.includes(jobId)
        ? `${import.meta.env.BASE_URL}sample/${jobId}.json`
        : `/api/dossier/${jobId}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch dossier')
      return response.json()
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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'history', label: 'History' },
    { id: 'validation', label: 'Validation' },
    { id: 'artifacts', label: 'Artifacts' },
  ]

  return (
    <div className="min-h-screen w-full" style={{ background: '#06080e' }}>
      {/* Sticky Header + Tabs */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#06080e',
        borderBottom: '1px solid #1c2640',
      }}>
        {/* Header row: Back · Run ID · Status · Duration */}
        <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Back link */}
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
          
          {/* Run ID */}
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
          
          {/* Status badge */}
          {getStatusBadge(dossier.state, dossier.current_pass)}
          
          <div style={{ width: '1px', height: '16px', background: '#1c2640' }} />
          
          {/* Duration */}
          <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
            <span style={{ marginRight: '6px' }}>Duration:</span>
            <span style={{ color: '#e0e8f8', fontWeight: 600 }}>
              {getDuration(dossier.created_at, dossier.updated_at)}
            </span>
          </div>
          
          {/* Cost (if available) */}
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
        
        {/* Tab bar directly below, same sticky unit */}
        <div style={{ padding: '0 32px', display: 'flex', gap: '0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === tab.id ? '#00e5ff' : '#7a8aaa',
                borderBottom: activeTab === tab.id ? '2px solid #00e5ff' : '2px solid transparent',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0, 229, 255, 0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#a0b0d0'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#7a8aaa'
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area with max width container */}
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
        {/* Main content area */}
        <div className="py-8 space-y-12" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <>
              <BeforeAfterCard dossier={dossier} />
              <StateMachine dossier={dossier} />
            </>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <PipelineDetail dossier={dossier} />
          )}

          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <ValidationResults dossier={dossier} />
          )}

          {/* Artifacts Tab */}
          {activeTab === 'artifacts' && (
            <Artifacts dossier={dossier} />
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusBadge(state: string, currentPass: string | null) {
  const styles: Record<string, { bg: string; color: string; border: string; glow?: string }> = {
    Complete: { bg: 'rgba(0, 223, 162, 0.15)', color: '#00dfa2', border: 'rgba(0, 223, 162, 0.4)' },
    Denoising: { bg: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: 'rgba(0, 229, 255, 0.4)', glow: '0 0 10px rgba(0, 229, 255, 0.2)' },
    Backpressure: { bg: 'rgba(255, 149, 0, 0.15)', color: '#ff9500', border: 'rgba(255, 149, 0, 0.4)', glow: '0 0 10px rgba(255, 149, 0, 0.2)' },
    Failed: { bg: 'rgba(255, 56, 56, 0.15)', color: '#ff3838', border: 'rgba(255, 56, 56, 0.4)' },
  }
  
  const s = styles[state] || { bg: 'rgba(122, 138, 170, 0.15)', color: '#7a8aaa', border: 'rgba(122, 138, 170, 0.4)' }
  const icons: Record<string, string> = { 
    Complete: '✓', 
    Denoising: '●', 
    Backpressure: '⚠', 
    Failed: '✕' 
  }
  
  return (
    <span
      className={state === 'Denoising' ? 'animate-pulse' : ''}
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
