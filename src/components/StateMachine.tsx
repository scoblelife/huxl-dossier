import type { Dossier, StageId, QualityTier } from '~/types/dossier'
import { STAGES_ORDERED } from '~/types/dossier'

interface StageInfo {
  id: StageId
  label: string
  description: string
}

const STAGES: StageInfo[] = [
  { id: 'Prospecting', label: 'Prospect', description: 'Finding the customer' },
  { id: 'Qualifying', label: 'Qualify', description: 'Confirming fit' },
  { id: 'Discovering', label: 'Discover', description: 'Understanding the problem' },
  { id: 'Scoping', label: 'Scope', description: 'Defining the build' },
  { id: 'Forging', label: 'Forge', description: 'Building the solution' },
  { id: 'Delivering', label: 'Deliver', description: 'Validating & shipping' },
  { id: 'Tempering', label: 'Temper', description: 'Strengthening output' },
  { id: 'Nurturing', label: 'Nurture', description: 'Growing success' },
]

const ACTOR_ZONES: Array<{
  label: string
  color: string
  stages: StageId[]
}> = [
  {
    label: 'CONCIERGE',
    color: '#00e5ff',
    stages: ['Prospecting', 'Qualifying', 'Discovering', 'Scoping'],
  },
  {
    label: 'FACTORY',
    color: '#ff9500',
    stages: ['Forging'],
  },
  {
    label: 'INSPECTOR + POST-DELIVERY',
    color: '#00dfa2',
    stages: ['Delivering', 'Tempering', 'Nurturing'],
  },
]

export function StateMachine({ dossier, onStageClick, selectedStage }: { dossier: Dossier; onStageClick?: (stage: StageId) => void; selectedStage?: StageId | null }) {
  const completedStages = new Set(
    dossier.pipeline_timeline
      .filter((t) => t.result === 'Ok')
      .map((t) => t.stage)
  )

  const currentStage = dossier.current_stage
  const failedStages = new Set(
    dossier.pipeline_timeline
      .filter((t) => t.result === 'Rejected' || t.result === 'GateFail')
      .map((t) => t.stage)
  )

  const currentStageInfo = STAGES.find((s) => s.id === currentStage)
  const currentTimeline = dossier.pipeline_timeline
    .filter((t) => t.stage === currentStage && !t.ended_at)
    .pop()

  const tier = dossier.tier

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h3
          style={{
            color: '#7a8aaa',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          LIFECYCLE OVERVIEW
        </h3>
        {tier && <TierBadge tier={tier} />}
      </div>

      <div
        style={{
          background: '#0c1019',
          border: '1px solid #1c2640',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {ACTOR_ZONES.map((zone, zoneIdx) => {
          const zoneStages = STAGES.filter((s) => zone.stages.includes(s.id))
          const isLastZone = zoneIdx === ACTOR_ZONES.length - 1
          const showGateAfter = zoneIdx === 0 || zoneIdx === 1

          return (
            <div key={zone.label}>
              {/* Actor zone header */}
              <div
                style={{
                  padding: '10px 20px',
                  background: `linear-gradient(to right, ${zone.color}08, transparent)`,
                  borderBottom: `1px solid ${zone.color}30`,
                  ...(zoneIdx > 0 ? { borderTop: `1px solid ${zone.color}30` } : {}),
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: zone.color,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  ▸ {zone.label}
                </div>
              </div>

              {/* Stages in this zone */}
              <div style={{ padding: '24px 20px' }}>
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  {zoneStages.map((stage, idx) => {
                    const isComplete = completedStages.has(stage.id)
                    const isCurrent = currentStage === stage.id
                    const isFailed = failedStages.has(stage.id)

                    return (
                      <div key={stage.id} className="flex items-center gap-1">
                        <StageNode
                          stage={stage}
                          isComplete={isComplete}
                          isCurrent={isCurrent}
                          isFailed={isFailed}
                          isSelected={selectedStage === stage.id}
                          accentColor={zone.color}
                          onClick={onStageClick ? () => onStageClick(stage.id) : undefined}
                        />
                        {idx < zoneStages.length - 1 && (
                          <Arrow
                            active={isComplete}
                            pulsing={isCurrent}
                            color={zone.color}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Gate between zones */}
              {showGateAfter && (
                <GateDivider
                  label={zoneIdx === 0 ? 'HUXL-DSL QUALITY GATE' : 'INSPECTOR GATE'}
                  gateKey={zoneIdx === 0 ? 'ConciergeToFactory' : 'FactoryToCustomer'}
                  dossier={dossier}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Current activity callout */}
      {currentStageInfo && currentTimeline && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: '8px',
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#7a8aaa', marginBottom: '8px', fontWeight: 600 }}>
            Currently: {currentStageInfo.label}
          </div>
          <div style={{ fontSize: '15px', color: '#e0e8f8', lineHeight: '1.7' }}>
            {currentStageInfo.description}
            {currentTimeline.model && (
              <span style={{ color: '#7a8aaa', fontSize: '13px', marginLeft: '12px' }}>
                · {currentTimeline.model}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TierBadge({ tier }: { tier: QualityTier }) {
  const colors: Record<QualityTier, { bg: string; color: string; border: string; glow: string }> = {
    B: { bg: 'rgba(122,138,170,0.15)', color: '#7a8aaa', border: 'rgba(122,138,170,0.4)', glow: 'none' },
    A: { bg: 'rgba(0,229,255,0.15)', color: '#00e5ff', border: 'rgba(0,229,255,0.4)', glow: '0 0 8px rgba(0,229,255,0.3)' },
    S: { bg: 'rgba(255,149,0,0.15)', color: '#ff9500', border: 'rgba(255,149,0,0.4)', glow: '0 0 12px rgba(255,149,0,0.4)' },
  }
  const c = colors[tier]
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 800,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        boxShadow: c.glow,
        letterSpacing: '0.05em',
      }}
    >
      TIER {tier}
    </span>
  )
}

function Arrow({ active, pulsing, color }: { active: boolean; pulsing: boolean; color: string }) {
  return (
    <div
      className={pulsing ? 'animate-pulse' : ''}
      style={{
        color: active ? `${color}99` : 'rgba(122, 138, 170, 0.3)',
        fontSize: '18px',
        margin: '0 4px',
        filter: pulsing ? `drop-shadow(0 0 4px ${color}99)` : 'none',
      }}
    >
      →
    </div>
  )
}

function GateDivider({
  label,
  gateKey,
  dossier,
}: {
  label: string
  gateKey: 'ConciergeToFactory' | 'FactoryToCustomer'
  dossier: Dossier
}) {
  const events = (dossier.gate_events || []).filter((e) => e.gate === gateKey)
  const lastEvent = events.length > 0 ? events[events.length - 1] : null
  const passed = lastEvent?.result === 'Pass'
  const rejected = lastEvent?.result === 'Reject'

  let borderColor = 'rgba(255, 149, 0, 0.3)'
  let iconColor = '#ff9500'
  let icon = '⬦'
  if (passed) {
    borderColor = 'rgba(0, 223, 162, 0.4)'
    iconColor = '#00dfa2'
    icon = '✓'
  } else if (rejected) {
    borderColor = 'rgba(255, 56, 56, 0.4)'
    iconColor = '#ff3838'
    icon = '✕'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 20px',
        borderTop: `1px dashed ${borderColor}`,
        borderBottom: `1px dashed ${borderColor}`,
        background: 'rgba(255, 149, 0, 0.03)',
      }}
    >
      <span style={{ color: iconColor, fontSize: '14px', fontWeight: 700 }}>{icon}</span>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: iconColor,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {lastEvent && (
        <span style={{ fontSize: '11px', color: '#7a8aaa', marginLeft: 'auto' }}>
          {lastEvent.summary}
        </span>
      )}
    </div>
  )
}

function StageNode({
  stage,
  isComplete,
  isCurrent,
  isFailed,
  isSelected,
  accentColor,
  onClick,
}: {
  stage: StageInfo
  isComplete: boolean
  isCurrent: boolean
  isFailed: boolean
  isSelected?: boolean
  accentColor: string
  onClick?: () => void
}) {
  let bgColor = 'rgba(122, 138, 170, 0.15)'
  let borderColor = 'rgba(122, 138, 170, 0.3)'
  let textColor = '#7a8aaa'
  let icon = '○'
  let glowClass = ''

  if (isComplete) {
    bgColor = 'rgba(0, 223, 162, 0.15)'
    borderColor = 'rgba(0, 223, 162, 0.5)'
    textColor = '#00dfa2'
    icon = '✓'
  } else if (isCurrent) {
    bgColor = `${accentColor}40`
    borderColor = accentColor
    textColor = accentColor
    icon = '●'
    glowClass = 'animate-pulse'
  } else if (isFailed) {
    bgColor = 'rgba(255, 56, 56, 0.15)'
    borderColor = 'rgba(255, 56, 56, 0.5)'
    textColor = '#ff3838'
    icon = '✕'
  }

  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '80px',
        minHeight: '110px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease',
        ...(isSelected ? { transform: 'scale(1.1)' } : {}),
      }}
      onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.transform = 'scale(1.08)' }}
      onMouseLeave={(e) => { if (isClickable) e.currentTarget.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)' }}
    >
      <div
        className={glowClass}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: `2px solid ${isSelected ? '#00e5ff' : borderColor}`,
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: textColor,
          flexShrink: 0,
          boxShadow: isSelected ? '0 0 16px rgba(0, 229, 255, 0.5)' : 'none',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        }}
      >
        {icon}
      </div>
      <div style={{ marginTop: '8px', fontWeight: 600, fontSize: '12px', color: textColor, textAlign: 'center' }}>
        {stage.label}
      </div>
      <div style={{ marginTop: '3px', fontSize: '10px', color: '#7a8aaa', textAlign: 'center', lineHeight: '1.4', maxWidth: '75px' }}>
        {stage.description}
      </div>
    </div>
  )
}
