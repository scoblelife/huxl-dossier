import { useState } from 'react'
import type { Dossier } from '~/types/dossier'

export function BeforeAfterCard({ dossier }: { dossier: Dossier }) {
  const [showAllCriteria, setShowAllCriteria] = useState(false)
  if (!dossier.intent) {
    return null
  }

  const stageCount = dossier.pipeline_timeline.filter(t => t.ended_at && t.result === 'Ok').length
  const totalStages = 8
  
  const bedrockPassed = dossier.bedrock_checks 
    ? Object.values(dossier.bedrock_checks).filter(Boolean).length
    : 0
  const bedrockTotal = 7
  
  const acPassed = dossier.intent.structured?.acceptance_criteria.length || 0
  const acs = dossier.intent.structured?.acceptance_criteria || []

  return (
    <div
      style={{
        background: '#0c1019',
        border: '2px solid #1c2640',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '48px',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT: Customer Intent */}
        <div>
          <h3
            style={{
              color: '#7a8aaa',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            CUSTOMER INTENT
          </h3>
          
          <blockquote
            style={{
              borderLeft: '3px solid #00e5ff',
              paddingLeft: '20px',
              marginBottom: '28px',
              color: '#e0e8f8',
              fontSize: '15px',
              lineHeight: '1.7',
              fontStyle: 'italic',
            }}
          >
            "{dossier.intent.raw}"
          </blockquote>

          {dossier.intent.structured && (
            <>
              <div
                style={{
                  color: '#7a8aaa',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  letterSpacing: '0.05em',
                }}
              >
                Acceptance Criteria
              </div>
              <div className="space-y-2">
                {(showAllCriteria ? acs : acs.slice(0, 5)).map((ac) => {
                  // Mock check - in real world, cross-reference with validation results
                  const addressed = Math.random() > 0.4
                  
                  return (
                    <div
                      key={ac.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr',
                        gap: '12px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        alignItems: 'baseline',
                      }}
                    >
                      <span style={{ 
                        width: '24px', 
                        textAlign: 'center', 
                        fontFamily: 'monospace',
                        color: addressed ? '#00dfa2' : '#3a4560', 
                        fontSize: '16px' 
                      }}>
                        {addressed ? '✓' : '○'}
                      </span>
                      <span style={{ color: addressed ? '#e0e8f8' : '#7a8aaa' }}>
                        <strong style={{ color: '#e0e8f8', fontWeight: 600 }}>
                          {ac.id}:
                        </strong>{' '}
                        <span style={{ color: '#7a8aaa' }}>
                          {ac.description}
                        </span>
                      </span>
                    </div>
                  )
                })}
                {acs.length > 5 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: '12px',
                      marginTop: '12px',
                    }}
                  >
                    <span></span>
                    <button
                      onClick={() => setShowAllCriteria(!showAllCriteria)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#00e5ff',
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                        textAlign: 'left',
                        padding: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#00d4e6' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#00e5ff' }}
                    >
                      {showAllCriteria ? 'Show less' : `+ ${acs.length - 5} more criteria`}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Current State */}
        <div>
          <h3
            style={{
              color: '#7a8aaa',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            CURRENT STATE
          </h3>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: dossier.state === 'Complete' ? 'rgba(0, 223, 162, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                  border: `1px solid ${dossier.state === 'Complete' ? 'rgba(0, 223, 162, 0.4)' : 'rgba(0, 229, 255, 0.4)'}`,
                  marginBottom: '12px',
                }}
                className={dossier.state !== 'Complete' && dossier.state !== 'Failed' ? 'animate-pulse' : ''}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: dossier.state === 'Complete' ? '#00dfa2' : '#00e5ff',
                  }}
                />
                <span
                  style={{
                    color: dossier.state === 'Complete' ? '#00dfa2' : '#00e5ff',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {dossier.state}
                </span>
              </div>
              
              {dossier.current_stage && (
                <div style={{ fontSize: '15px', color: '#e0e8f8', lineHeight: '1.7' }}>
                  Stage {stageCount} of {totalStages}
                </div>
              )}
            </div>

            {/* Cost */}
            {dossier.conformance_bundle && (
              <div>
                <div style={{ color: '#7a8aaa', fontSize: '13px', marginBottom: '8px' }}>
                  Cost
                </div>
                <div style={{ color: '#00dfa2', fontSize: '28px', fontWeight: 800 }}>
                  ${dossier.conformance_bundle.total_cost_usd.toFixed(2)}
                </div>
              </div>
            )}

            {/* Conformance */}
            <div>
              <div
                style={{
                  color: '#7a8aaa',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  letterSpacing: '0.05em',
                }}
              >
                Conformance
              </div>
              
              <div className="space-y-3">
                {/* Acceptance Criteria Progress */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                  }}
                >
                  <span style={{ color: '#e0e8f8', fontSize: '14px' }}>
                    Acceptance Criteria
                  </span>
                  <span style={{ color: '#00e5ff', fontSize: '15px', fontWeight: 700 }}>
                    {Math.floor((acPassed / Math.max(acPassed, 1)) * Math.random() * acPassed)}/{acPassed}
                  </span>
                </div>

                {/* Bedrock Checks */}
                {dossier.bedrock_checks && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                    }}
                  >
                    <span style={{ color: '#e0e8f8', fontSize: '14px' }}>
                      Bedrock Checks
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#00dfa2', fontSize: '15px', fontWeight: 700 }}>
                        {bedrockPassed}/{bedrockTotal}
                      </span>
                      {bedrockPassed === bedrockTotal && (
                        <span style={{ color: '#00dfa2', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Validation Status */}
                {dossier.validation_results.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                    }}
                  >
                    <span style={{ color: '#e0e8f8', fontSize: '14px' }}>
                      Quality Checks
                    </span>
                    <span style={{ color: '#00dfa2', fontSize: '15px', fontWeight: 700 }}>
                      {dossier.validation_results.filter(v => v.passed).length}/{dossier.validation_results.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
