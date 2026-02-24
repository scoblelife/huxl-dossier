import type { Dossier } from '~/types/dossier'

export function Artifacts({ dossier }: { dossier: Dossier }) {
  const { conformance_bundle, bedrock_checks, cost_verification } = dossier

  if (!conformance_bundle && !bedrock_checks && !cost_verification && !dossier.artifacts.repo_url) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Light zone header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          background: 'linear-gradient(to right, rgba(255, 220, 100, 0.06), transparent)',
          border: '1px solid rgba(255, 220, 100, 0.15)',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ffdc64',
            boxShadow: '0 0 12px rgba(255, 220, 100, 0.5)',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffdc64', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Light Zone — Customer Deliverables
          </div>
          <div style={{ fontSize: '12px', color: '#7a8aaa', marginTop: '2px' }}>
            These artifacts exit the dark factory and are delivered to the customer
          </div>
        </div>
      </div>

      {conformance_bundle && <ConformanceBundle bundle={conformance_bundle} />}
      {bedrock_checks && <BedrockChecks checks={bedrock_checks} />}
      {cost_verification && <CostVerification verification={cost_verification} />}
      {dossier.artifacts.repo_url && <RepoLink url={dossier.artifacts.repo_url} />}
    </div>
  )
}

function ConformanceBundle({ bundle }: { bundle: NonNullable<Dossier['conformance_bundle']> }) {
  return (
    <div
      style={{
        background: '#0c1019',
        border: '1px solid #1c2640',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Header with key metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: '#1c2640',
          borderBottom: '1px solid #1c2640',
        }}
      >
        {[
          { label: 'Total Attempts', value: String(bundle.total_attempts), color: '#e0e8f8' },
          { label: 'Stages Completed', value: String(bundle.stages_completed.length), color: '#e0e8f8' },
          { label: 'Total Cost', value: `$${bundle.total_cost_usd.toFixed(2)}`, color: '#00dfa2' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#0c1019', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Stage audit trail */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Stage Audit Trail
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {bundle.stages_completed.map((entry) => (
            <div
              key={entry.stage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#06080e',
                borderRadius: '6px',
                border: '1px solid rgba(28, 38, 64, 0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00dfa2', fontSize: '14px' }}>✓</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e0e8f8', fontFamily: 'monospace' }}>
                  {entry.stage}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                <span style={{ color: '#7a8aaa' }}>
                  {entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}
                </span>
                {entry.gate_events > 0 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'rgba(255, 149, 0, 0.15)',
                      color: '#ff9500',
                    }}
                  >
                    {entry.gate_events} gate event{entry.gate_events !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BedrockChecks({ checks }: { checks: NonNullable<Dossier['bedrock_checks']> }) {
  const checkList = [
    { key: 'compiles', label: 'Code Compiles', value: checks.compiles },
    { key: 'boots', label: 'Service Boots', value: checks.boots },
    { key: 'health_check_passes', label: 'Health Check Passes', value: checks.health_check_passes },
    { key: 'security_scan_clean', label: 'Security Scan Clean', value: checks.security_scan_clean },
    { key: 'no_secret_leaks', label: 'No Secret Leaks', value: checks.no_secret_leaks },
    { key: 'resource_bounded', label: 'Resource Bounded', value: checks.resource_bounded },
    { key: 'observability_hooks', label: 'Observability Hooks', value: checks.observability_hooks },
  ]

  const allPassed = checkList.every((c) => c.value)
  const passedCount = checkList.filter((c) => c.value).length

  return (
    <div
      style={{
        background: '#0c1019',
        border: `1px solid ${allPassed ? 'rgba(0, 223, 162, 0.3)' : '#1c2640'}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1c2640',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: allPassed ? 'rgba(0, 223, 162, 0.04)' : 'transparent',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f8' }}>Bedrock Checks</div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            background: allPassed ? 'rgba(0, 223, 162, 0.15)' : 'rgba(255, 149, 0, 0.15)',
            color: allPassed ? '#00dfa2' : '#ff9500',
            letterSpacing: '0.03em',
          }}
        >
          {allPassed ? '✓ All Passed' : `${passedCount}/${checkList.length} Passed`}
        </div>
      </div>

      {/* Grid of checks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1px',
          background: '#1c2640',
        }}
      >
        {checkList.map((check) => (
          <div
            key={check.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 20px',
              background: '#0c1019',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
                background: check.value ? 'rgba(0, 223, 162, 0.15)' : 'rgba(255, 56, 56, 0.15)',
                border: `1px solid ${check.value ? 'rgba(0, 223, 162, 0.4)' : 'rgba(255, 56, 56, 0.4)'}`,
                color: check.value ? '#00dfa2' : '#ff3838',
              }}
            >
              {check.value ? '✓' : '✕'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#e0e8f8' }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CostVerification({ verification }: { verification: NonNullable<Dossier['cost_verification']> }) {
  return (
    <div
      style={{
        background: '#0c1019',
        border: `1px solid ${verification.within_budget ? 'rgba(0, 223, 162, 0.3)' : 'rgba(255, 56, 56, 0.3)'}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1c2640',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: verification.within_budget ? 'rgba(0, 223, 162, 0.04)' : 'rgba(255, 56, 56, 0.04)',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f8' }}>Cost Verification</div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            background: verification.within_budget ? 'rgba(0, 223, 162, 0.15)' : 'rgba(255, 56, 56, 0.15)',
            color: verification.within_budget ? '#00dfa2' : '#ff3838',
          }}
        >
          {verification.within_budget ? '✓ Within Budget' : '✕ Over Budget'}
        </div>
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: verification.measured_cycles_per_unit !== null ? '1fr 1fr' : '1fr',
          gap: '1px',
          background: '#1c2640',
          borderBottom: '1px solid #1c2640',
        }}
      >
        <div style={{ background: '#0c1019', padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Estimated Monthly Cycles
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#e0e8f8' }}>
            {verification.estimated_monthly_cycles_t.toFixed(2)}T
          </div>
        </div>
        {verification.measured_cycles_per_unit !== null && (
          <div style={{ background: '#0c1019', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Cycles Per Unit
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#e0e8f8' }}>
              {verification.measured_cycles_per_unit.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Component breakdown */}
        {verification.component_costs.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Component Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {verification.component_costs.map((component, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: '#06080e',
                    borderRadius: '6px',
                    border: '1px solid rgba(28, 38, 64, 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background:
                          component.tier === 1 ? 'rgba(255, 56, 56, 0.15)' :
                          component.tier === 2 ? 'rgba(255, 149, 0, 0.15)' :
                          'rgba(84, 96, 128, 0.15)',
                        color:
                          component.tier === 1 ? '#ff3838' :
                          component.tier === 2 ? '#ff9500' :
                          '#7a8aaa',
                      }}
                    >
                      T{component.tier}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#e0e8f8', fontFamily: 'monospace' }}>
                      {component.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#7a8aaa', fontFamily: 'monospace' }}>
                    {(component.estimated_monthly_cycles / 1_000_000_000_000).toFixed(4)}T
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimizations */}
        {verification.optimizations_applied.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Optimizations Applied
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {verification.optimizations_applied.map((opt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#e0e8f8',
                    lineHeight: '1.5',
                  }}
                >
                  <span style={{ color: '#00dfa2', fontWeight: 700, flexShrink: 0 }}>▸</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RepoLink({ url }: { url: string }) {
  return (
    <div
      style={{
        background: '#0c1019',
        border: '1px solid rgba(0, 229, 255, 0.2)',
        borderRadius: '10px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ fontSize: '11px', color: '#7a8aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Repository
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#00e5ff',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
        >
          {url}
        </a>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          color: '#00e5ff',
          fontSize: '12px',
          fontWeight: 700,
          textDecoration: 'none',
          letterSpacing: '0.05em',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)'
        }}
      >
        OPEN →
      </a>
    </div>
  )
}
