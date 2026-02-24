import type { Dossier } from '~/types/dossier'

export function PendingActivities({ dossier }: { dossier: Dossier }) {
  if (dossier.state !== 'Denoising' || !dossier.current_pass) {
    return null
  }
  
  const currentTimeline = dossier.pipeline_timeline
    .filter((t) => t.pass === dossier.current_pass && !t.ended_at)
    .pop()
  
  if (!currentTimeline) return null
  
  const elapsed = Date.now() - new Date(currentTimeline.started_at).getTime()
  const elapsedStr = formatElapsed(elapsed)
  
  return (
    <div style={{ background: '#0c1019', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '10px', padding: '20px' }} className="sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          <h3 className="text-base sm:text-lg font-semibold text-blue-400">Currently Executing</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-bg rounded text-xs border border-accent/30" style={{ color: '#546080' }}>
          <span style={{ color: '#00e5ff' }}>🏭</span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} className="hidden sm:inline">INSIDE DARK FACTORY · AUTONOMOUS</span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} className="sm:hidden">AUTONOMOUS</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div>
          <div className="text-xs" style={{ color: '#546080', marginBottom: '8px' }}>Pass</div>
          <code className="text-sm font-medium" style={{ color: '#00e5ff' }}>{dossier.current_pass}</code>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#546080', marginBottom: '8px' }}>Attempt</div>
          <span className="text-sm font-medium" style={{ color: '#ff9500' }}>#{dossier.current_attempt}</span>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#546080', marginBottom: '8px' }}>Model</div>
          <code className="text-sm" style={{ color: '#e0e8f8' }}>{currentTimeline.model}</code>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#546080', marginBottom: '8px' }}>Elapsed</div>
          <span className="text-sm font-mono" style={{ color: '#e0e8f8' }}>{elapsedStr}</span>
        </div>
      </div>
    </div>
  )
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  if (minutes > 0) return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
  return `0:${String(seconds).padStart(2, '0')}`
}
