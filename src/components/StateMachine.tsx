import type { Dossier, PassId } from '~/types/dossier'

const PASSES: Array<{ id: PassId; label: string; description: string }> = [
  { id: 'Groom', label: 'Groom', description: 'Clean & structure raw input' },
  { id: 'IntentDenoise', label: 'Intent', description: 'Clarify requirements & constraints' },
  { id: 'ArchitectureDenoise', label: 'Architecture', description: 'Design system structure' },
  { id: 'ImplementationDenoise', label: 'Implementation', description: 'Build & validate code' },
  { id: 'IntegrationDenoise', label: 'Integration', description: 'Wire components together' },
  { id: 'IntentVerification', label: 'Verification', description: 'Verify against original intent' },
]

export function StateMachine({ dossier }: { dossier: Dossier }) {
  const completedPasses = new Set(
    dossier.pipeline_timeline
      .filter((t) => t.result === 'Ok')
      .map((t) => t.pass)
  )
  
  const currentPass = dossier.current_pass
  const failedPasses = new Set(
    dossier.pipeline_timeline
      .filter((t) => t.result === 'Backpressure' || t.result === 'Retry')
      .map((t) => t.pass)
  )

  // Get current activity description
  const currentPassInfo = PASSES.find(p => p.id === currentPass)
  const currentTimeline = dossier.pipeline_timeline
    .filter((t) => t.pass === currentPass && !t.ended_at)
    .pop()

  return (
    <div>
      {/* Header */}
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
        PIPELINE OVERVIEW
      </h3>

      <div
        style={{
          background: '#0c1019',
          border: '1px solid #1c2640',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Dark Factory Entry */}
        <div
          style={{
            borderBottom: '1px solid rgba(255, 149, 0, 0.2)',
            padding: '12px 20px',
            background: 'linear-gradient(to bottom, rgba(255, 149, 0, 0.05), transparent)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#ff9500',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            ▸ DARK FACTORY ▸
          </div>
        </div>

        {/* Pipeline Passes */}
        <div style={{ padding: '32px 20px' }}>
          <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            {PASSES.map((pass, idx) => {
              const isComplete = completedPasses.has(pass.id)
              const isCurrent = currentPass === pass.id
              const isFailed = failedPasses.has(pass.id)
              const currentIndex = PASSES.findIndex(p => p.id === currentPass)
              const isArrowBeforeCurrent = idx < currentIndex
              const isArrowAfterCurrent = idx >= currentIndex
              
              return (
                <div key={pass.id} className="flex items-center gap-1">
                  <PassNode
                    pass={pass}
                    isComplete={isComplete}
                    isCurrent={isCurrent}
                    isFailed={isFailed}
                  />
                  
                  {idx < PASSES.length - 1 && (
                    <div
                      className={idx === currentIndex - 1 ? 'animate-pulse' : ''}
                      style={{
                        color: idx < currentIndex ? 'rgba(0, 229, 255, 0.6)' : 'rgba(122, 138, 170, 0.3)',
                        fontSize: '18px',
                        margin: '0 4px',
                        filter: idx === currentIndex - 1 ? 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.6))' : 'none',
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Current Activity */}
          {currentPassInfo && currentTimeline && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px 20px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: '#7a8aaa',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Currently Running
              </div>
              <div style={{ fontSize: '15px', color: '#e0e8f8', lineHeight: '1.7' }}>
                {currentPassInfo.description}
                {currentTimeline.model && (
                  <span style={{ color: '#7a8aaa', fontSize: '13px', marginLeft: '12px' }}>
                    · {currentTimeline.model}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Factory Exit */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 149, 0, 0.2)',
            padding: '12px 20px',
            background: 'linear-gradient(to top, rgba(255, 149, 0, 0.05), transparent)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#ff9500',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            ▸ DELIVERY ▸
          </div>
        </div>
      </div>
    </div>
  )
}

function PassNode({
  pass,
  isComplete,
  isCurrent,
  isFailed,
}: {
  pass: { id: PassId; label: string; description: string }
  isComplete: boolean
  isCurrent: boolean
  isFailed: boolean
}) {
  let containerClass = 'rgba(122, 138, 170, 0.15)'
  let borderColor = 'rgba(122, 138, 170, 0.3)'
  let textColor = '#7a8aaa'
  let icon = '○'
  let glowClass = ''
  
  if (isComplete) {
    containerClass = 'rgba(0, 229, 255, 0.15)'
    borderColor = 'rgba(0, 229, 255, 0.5)'
    textColor = '#00e5ff'
    icon = '✓'
  } else if (isCurrent) {
    containerClass = 'rgba(0, 229, 255, 0.25)'
    borderColor = '#00e5ff'
    textColor = '#00e5ff'
    icon = '●'
    glowClass = 'animate-pulse'
  } else if (isFailed) {
    containerClass = 'rgba(255, 56, 56, 0.15)'
    borderColor = 'rgba(255, 56, 56, 0.5)'
    textColor = '#ff3838'
    icon = '✕'
  }
  
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100px', 
        minHeight: '130px' 
      }}
    >
      <div
        className={glowClass}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          background: containerClass,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: textColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          marginTop: '8px',
          fontWeight: 600,
          fontSize: '13px',
          color: textColor,
          textAlign: 'center',
        }}
      >
        {pass.label}
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '11px',
          color: '#7a8aaa',
          textAlign: 'center',
          lineHeight: '1.4',
          maxWidth: '90px',
        }}
      >
        {pass.description}
      </div>
    </div>
  )
}
