import type { Dossier } from '~/types/dossier'

export function Artifacts({ dossier }: { dossier: Dossier }) {
  const { conformance_bundle, bedrock_checks, cost_verification } = dossier
  
  if (!conformance_bundle && !bedrock_checks && !cost_verification) {
    return (
      <div className="p-5 sm:p-12 text-center" style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
        <div className="mb-2" style={{ color: '#546080' }}>No artifacts yet</div>
        <div className="text-sm" style={{ color: '#546080' }}>
          Conformance bundle, bedrock checks, and cost verification will appear here when the
          pipeline completes
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Light zone indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-1 rounded" style={{ background: 'rgba(26, 31, 53, 0.5)', border: '1px solid #546080', color: '#e0e8f8' }}>
          ☀️ LIGHT ZONE - Customer Deliverables
        </span>
        <span style={{ color: '#546080' }}>
          These artifacts exit the dark factory and go to the customer
        </span>
      </div>

      {conformance_bundle && <ConformanceBundle bundle={conformance_bundle} />}
      
      {bedrock_checks && <BedrockChecks checks={bedrock_checks} />}
      
      {cost_verification && <CostVerification verification={cost_verification} />}
      
      {dossier.artifacts.repo_url && (
        <div className="p-5 sm:p-8" style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#e0e8f8' }}>Repository</h3>
          <a
            href={dossier.artifacts.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#00e5ff', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {dossier.artifacts.repo_url}
          </a>
        </div>
      )}
    </div>
  )
}

function ConformanceBundle({ bundle }: { bundle: NonNullable<Dossier['conformance_bundle']> }) {
  return (
    <div className="p-5 sm:p-8" style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#e0e8f8' }}>Conformance Bundle</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded p-4" style={{ background: '#06080e' }}>
          <div className="text-sm mb-1" style={{ color: '#546080' }}>Total Attempts</div>
          <div className="text-2xl font-bold" style={{ color: '#e0e8f8' }}>{bundle.total_attempts}</div>
        </div>
        <div className="rounded p-4" style={{ background: '#06080e' }}>
          <div className="text-sm mb-1" style={{ color: '#546080' }}>Stages Completed</div>
          <div className="text-2xl font-bold" style={{ color: '#e0e8f8' }}>{bundle.stages_completed.length}</div>
        </div>
        <div className="rounded p-4" style={{ background: '#06080e' }}>
          <div className="text-sm mb-1" style={{ color: '#546080' }}>Total Cost</div>
          <div className="text-2xl font-bold" style={{ color: '#00dfa2' }}>${bundle.total_cost_usd.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2" style={{ color: '#546080' }}>Stage Audit Trail</div>
        {bundle.stages_completed.map((entry) => (
          <div key={entry.stage} className="flex items-center justify-between rounded px-4 py-2" style={{ background: '#06080e' }}>
            <code className="text-sm" style={{ color: '#e0e8f8' }}>{entry.stage}</code>
            <div className="flex items-center gap-4 text-sm" style={{ color: '#546080' }}>
              <span>{entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}</span>
              {entry.gate_events > 0 && (
                <span style={{ color: '#ff9500' }}>
                  {entry.gate_events} gate event{entry.gate_events !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
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
  
  return (
    <div className="p-5 sm:p-8" style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#e0e8f8' }}>Bedrock Checks</h3>
        {allPassed ? (
          <span className="px-3 py-1 rounded text-sm font-medium" style={{ background: 'rgba(0, 223, 162, 0.2)', color: '#00dfa2' }}>
            ✓ All Passed
          </span>
        ) : (
          <span className="px-3 py-1 rounded text-sm font-medium" style={{ background: 'rgba(255, 56, 56, 0.2)', color: '#ff3838' }}>
            ✕ Some Failed
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checkList.map((check) => (
          <div
            key={check.key}
            className="flex items-center gap-3 p-3 rounded"
            style={{
              background: check.value ? 'rgba(0, 223, 162, 0.1)' : 'rgba(255, 56, 56, 0.1)',
              border: `1px solid ${check.value ? 'rgba(0, 223, 162, 0.3)' : 'rgba(255, 56, 56, 0.3)'}`
            }}
          >
            <div className="text-2xl">{check.value ? '🟢' : '🔴'}</div>
            <div className="text-sm font-medium" style={{ color: '#e0e8f8' }}>{check.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CostVerification({
  verification,
}: {
  verification: NonNullable<Dossier['cost_verification']>
}) {
  return (
    <div className="p-5 sm:p-8" style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#e0e8f8' }}>Cost Verification</h3>
        {verification.within_budget ? (
          <span className="px-3 py-1 rounded text-sm font-medium" style={{ background: 'rgba(0, 223, 162, 0.2)', color: '#00dfa2' }}>
            ✓ Within Budget
          </span>
        ) : (
          <span className="px-3 py-1 rounded text-sm font-medium" style={{ background: 'rgba(255, 56, 56, 0.2)', color: '#ff3838' }}>
            ✕ Over Budget
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded p-4" style={{ background: '#06080e' }}>
          <div className="text-sm mb-1" style={{ color: '#546080' }}>Estimated Monthly Cycles</div>
          <div className="text-2xl font-bold" style={{ color: '#e0e8f8' }}>
            {verification.estimated_monthly_cycles_t.toFixed(2)}T
          </div>
        </div>
        {verification.measured_cycles_per_unit !== null && (
          <div className="rounded p-4" style={{ background: '#06080e' }}>
            <div className="text-sm mb-1" style={{ color: '#546080' }}>Cycles Per Unit</div>
            <div className="text-2xl font-bold" style={{ color: '#e0e8f8' }}>
              {verification.measured_cycles_per_unit.toLocaleString()}
            </div>
          </div>
        )}
      </div>
      
      {verification.component_costs.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium mb-2" style={{ color: '#546080' }}>Component Breakdown</div>
          <div className="space-y-2">
            {verification.component_costs.map((component, idx) => (
              <div key={idx} className="flex items-center justify-between rounded px-4 py-2" style={{ background: '#06080e' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: component.tier === 1 ? 'rgba(255, 56, 56, 0.2)' : component.tier === 2 ? 'rgba(255, 149, 0, 0.2)' : 'rgba(84, 96, 128, 0.2)',
                      color: component.tier === 1 ? '#ff3838' : component.tier === 2 ? '#ff9500' : '#546080'
                    }}
                  >
                    Tier {component.tier}
                  </span>
                  <code className="text-sm" style={{ color: '#e0e8f8' }}>{component.name}</code>
                </div>
                <div className="text-sm" style={{ color: '#546080' }}>
                  {(component.estimated_monthly_cycles / 1_000_000_000_000).toFixed(3)}T
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {verification.optimizations_applied.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: '#546080' }}>Optimizations Applied</div>
          <ul className="space-y-1">
            {verification.optimizations_applied.map((opt, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#e0e8f8' }}>
                <span style={{ color: '#00dfa2' }}>•</span>
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
