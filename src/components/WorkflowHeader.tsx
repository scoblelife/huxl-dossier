import { Link } from '@tanstack/react-router'
import type { Dossier } from '~/types/dossier'

export function WorkflowHeader({ dossier }: { dossier: Dossier }) {
  const statusBadge = getStatusBadge(dossier.state, dossier.current_pass)
  const duration = getDuration(dossier.created_at, dossier.updated_at)
  
  return (
    <div style={{ 
      background: '#0c1019', 
      borderBottom: '1px solid #1c2640',
      padding: '16px 0',
    }}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
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
        
        <div style={{ 
          width: '1px', 
          height: '16px', 
          background: '#1c2640',
          display: 'none',
        }} className="sm:block" />
        
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
        
        <div style={{ 
          width: '1px', 
          height: '16px', 
          background: '#1c2640' 
        }} />
        
        {/* Status badge */}
        {statusBadge}
        
        <div style={{ 
          width: '1px', 
          height: '16px', 
          background: '#1c2640',
          display: 'none',
        }} className="sm:block" />
        
        {/* Duration */}
        <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
          <span style={{ marginRight: '6px' }}>Duration:</span>
          <span style={{ color: '#e0e8f8', fontWeight: 600 }}>{duration}</span>
        </div>
        
        {/* Cost (if available) */}
        {dossier.conformance_bundle && (
          <>
            <div style={{ 
              width: '1px', 
              height: '16px', 
              background: '#1c2640',
              display: 'none',
            }} className="sm:block" />
            
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
