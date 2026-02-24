import { useState } from 'react'
import type { Dossier } from '~/types/dossier'

export function ValidationResults({ dossier }: { dossier: Dossier }) {
  const [expanded, setExpanded] = useState(false)
  const semgrepChecks = dossier.validation_results.filter((v) => v.source === 'semgrep')
  const rustChecks = dossier.validation_results.filter((v) => v.source === 'rust')
  
  if (dossier.validation_results.length === 0) {
    return null
  }

  const totalPassed = dossier.validation_results.filter(v => v.passed).length
  const totalFailed = dossier.validation_results.length - totalPassed
  
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
        VALIDATION & CONFORMANCE
      </h3>

      <div
        style={{
          background: '#0c1019',
          border: '1px solid #1c2640',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Summary header (always visible) */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e0e8f8', marginBottom: '8px' }}>
              Quality Checks
            </div>
            <div style={{ fontSize: '13px', color: '#7a8aaa' }}>
              <span style={{ color: '#00dfa2', fontWeight: 600 }}>{totalPassed} passed</span>
              {totalFailed > 0 && (
                <>
                  <span style={{ margin: '0 8px' }}>·</span>
                  <span style={{ color: '#ff3838', fontWeight: 600 }}>{totalFailed} failed</span>
                </>
              )}
            </div>
          </div>
          <span style={{ color: '#7a8aaa', fontSize: '16px' }}>
            {expanded ? '▼' : '▶'}
          </span>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div style={{ borderTop: '1px solid #1c2640' }}>
            {semgrepChecks.length > 0 && (
              <CheckGroup title="Semgrep Security & Quality Checks" checks={semgrepChecks} />
            )}
            
            {rustChecks.length > 0 && (
              <CheckGroup title="Rust Type & Safety Validators" checks={rustChecks} />
            )}
          </div>
        )}
      </div>

      {/* Bedrock Checks */}
      {dossier.bedrock_checks && (
        <BedrockGrid checks={dossier.bedrock_checks} />
      )}

      {/* Cost Verification */}
      {dossier.conformance_bundle && (
        <CostBreakdown cost={dossier.conformance_bundle.total_cost_usd} />
      )}
    </div>
  )
}

function CheckGroup({
  title,
  checks,
}: {
  title: string
  checks: Dossier['validation_results']
}) {
  const passed = checks.filter((c) => c.passed).length
  const failed = checks.length - passed
  
  return (
    <div>
      <div style={{ borderBottom: '1px solid #1c2640', padding: '20px' }}>
        <div className="flex items-center justify-between">
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f8' }}>{title}</h4>
          <div className="flex items-center gap-3" style={{ fontSize: '13px' }}>
            <span style={{ color: '#00dfa2' }}>✓ {passed}</span>
            {failed > 0 && <span style={{ color: '#ff3838' }}>✕ {failed}</span>}
          </div>
        </div>
      </div>
      
      <div>
        {checks.map((check, idx) => (
          <CheckRow key={idx} check={check} />
        ))}
      </div>
    </div>
  )
}

function CheckRow({ check }: { check: Dossier['validation_results'][0] }) {
  const [expanded, setExpanded] = useState(!check.passed)
  
  return (
    <div style={{ borderBottom: '1px solid #1c2640' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '16px 20px' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0" style={{ fontSize: '18px' }}>
            {check.passed ? '✅' : '❌'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <code style={{ fontSize: '14px', fontWeight: 600, color: '#e0e8f8' }}>{check.check}</code>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: check.severity === 'Hard' ? 'rgba(255, 56, 56, 0.2)' : 'rgba(255, 149, 0, 0.2)',
                  color: check.severity === 'Hard' ? '#ff3838' : '#ff9500'
                }}
              >
                {check.severity}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#7a8aaa', lineHeight: '1.6' }}>{check.detail}</div>
          </div>
          
          <div className="flex-shrink-0" style={{ color: '#7a8aaa' }}>
            {expanded ? '▼' : '▶'}
          </div>
        </div>
      </button>
      
      {expanded && (
        <div className="space-y-5" style={{ borderTop: '1px solid rgba(28, 38, 64, 0.5)', padding: '16px 20px 16px 58px' }}>
          {check.rationale && (
            <div>
              <div style={{ fontSize: '11px', marginBottom: '6px', color: '#7a8aaa', fontWeight: 600 }}>Rationale</div>
              <div style={{ fontSize: '14px', color: '#e0e8f8', lineHeight: '1.7' }}>{check.rationale}</div>
            </div>
          )}
          
          {check.fix_instructions && (
            <div>
              <div style={{ fontSize: '11px', marginBottom: '6px', color: '#7a8aaa', fontWeight: 600 }}>Fix Instructions</div>
              <div style={{ fontSize: '13px', borderRadius: '6px', background: '#06080e', border: '1px solid #1c2640', color: '#e0e8f8', padding: '12px', lineHeight: '1.7' }}>
                {check.fix_instructions}
              </div>
            </div>
          )}
          
          {check.files_to_change.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', marginBottom: '6px', color: '#7a8aaa', fontWeight: 600 }}>Files to Change</div>
              <div className="flex flex-wrap gap-2">
                {check.files_to_change.map((file, idx) => (
                  <code key={idx} style={{ fontSize: '12px', borderRadius: '4px', background: '#06080e', border: '1px solid #1c2640', color: '#e0e8f8', padding: '4px 8px' }}>
                    {file}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BedrockGrid({ checks }: { checks: NonNullable<Dossier['bedrock_checks']> }) {
  const checkList = [
    { key: 'compiles', label: 'Compiles', value: checks.compiles },
    { key: 'boots', label: 'Boots', value: checks.boots },
    { key: 'health_check_passes', label: 'Health Check', value: checks.health_check_passes },
    { key: 'security_scan_clean', label: 'Security Scan', value: checks.security_scan_clean },
    { key: 'no_secret_leaks', label: 'No Secrets', value: checks.no_secret_leaks },
    { key: 'resource_bounded', label: 'Resources OK', value: checks.resource_bounded },
    { key: 'observability_hooks', label: 'Observability', value: checks.observability_hooks },
  ]

  const allPassed = checkList.every((c) => c.value)
  const passedCount = checkList.filter(c => c.value).length

  return (
    <div style={{ marginTop: '32px' }}>
      <div
        style={{
          background: '#0c1019',
          border: '1px solid #1c2640',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f8' }}>
            Bedrock Checks
          </h4>
          <div style={{ fontSize: '13px', fontWeight: 700, color: allPassed ? '#00dfa2' : '#ff9500' }}>
            {passedCount}/{checkList.length}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {checkList.map((check) => (
            <div
              key={check.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: check.value ? 'rgba(0, 223, 162, 0.1)' : 'rgba(255, 56, 56, 0.1)',
                border: `1px solid ${check.value ? 'rgba(0, 223, 162, 0.3)' : 'rgba(255, 56, 56, 0.3)'}`,
              }}
            >
              <span style={{ fontSize: '14px' }}>{check.value ? '✓' : '✕'}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e0e8f8' }}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CostBreakdown({ cost }: { cost: number }) {
  return (
    <div style={{ marginTop: '32px' }}>
      <div
        style={{
          background: '#0c1019',
          border: '1px solid #1c2640',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <div className="flex items-center justify-between">
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f8' }}>
            Total Cost
          </h4>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00dfa2' }}>
            ${cost.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
