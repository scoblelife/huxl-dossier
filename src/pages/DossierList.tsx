import { Link } from '@tanstack/react-router'

const activeDossiers = [
  {
    id: 'kith-build',
    title: 'Kith — GitHub Replacement',
    type: 'Platform',
    stage: 'Forging',
    tier: 'S',
    progress: '5/8',
    cost: '$0.85',
    status: 'FORGING',
    statusColor: '#ff9500',
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  {
    id: 'sample',
    title: 'Rate Limiter — Library',
    type: 'Library',
    stage: 'Forging',
    tier: 'A',
    progress: null,
    cost: null,
    status: 'FORGING',
    statusColor: '#ff9500',
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
]

const completedDossiers = [
  {
    id: 'complete',
    title: 'Web Service',
    type: 'Service',
    stage: 'All 8 stages',
    tier: 'B',
    progress: null,
    cost: '$0.64',
    checks: 14,
    status: 'COMPLETE',
    statusColor: '#00dfa2',
    borderColor: 'rgba(0, 223, 162, 0.2)',
  },
]

export function DossierList() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 sm:py-16 px-5 sm:px-8" style={{ background: '#06080e' }}>
      {/* Hero */}
      <div className="mb-12 sm:mb-16 text-center">
        <div className="inline-block mb-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight leading-none">
            <span style={{ color: '#e0e8f8' }}>HUXL</span>
          </h1>
          <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent 0%, #00e5ff 50%, transparent 100%)' }} />
          <p className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#7a8aaa' }}>
            CONCIERGE · FACTORY · INSPECTOR
          </p>
          <p style={{ color: '#6a7a9a' }} className="text-sm font-mono tracking-wide">
            Outcome, Engineered
          </p>
        </div>
      </div>

      <div className="w-full" style={{ maxWidth: '768px' }}>
        {/* Active Runs Section */}
        {activeDossiers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest" style={{ color: '#00e5ff', letterSpacing: '0.15em' }}>
                ACTIVE RUNS
              </h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #00e5ff 0%, transparent 100%)' }} />
            </div>

            <div className="space-y-4">
              {activeDossiers.map((d) => (
                <Link
                  key={d.id}
                  to="/dossier/$jobId"
                  params={{ jobId: d.id }}
                  className="block hover:glow-cyan-subtle"
                  style={{
                    background: '#0c1019',
                    border: `1px solid ${d.borderColor}`,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s',
                    padding: '20px',
                    marginBottom: '16px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2" style={{ color: '#e0e8f8', fontSize: '18px', lineHeight: '1.3' }}>
                        {d.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2" style={{ fontSize: '15px' }}>
                        <span style={{ color: '#7a8aaa' }}>{d.type}</span>
                        <span style={{ color: '#3a4560' }}>·</span>
                        <span style={{ color: '#7a8aaa' }}>{d.stage}</span>
                        <span style={{ color: '#3a4560' }}>·</span>
                        <TierLabel tier={d.tier} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '15px' }}>
                        {d.progress && (
                          <>
                            <span style={{ color: '#7a8aaa' }}>Stage {d.progress}</span>
                            <span style={{ color: '#3a4560' }}>·</span>
                          </>
                        )}
                        {d.cost && <span style={{ color: '#7a8aaa' }}>{d.cost}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className="animate-border-glow"
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: `${d.statusColor}12`,
                          color: d.statusColor,
                          border: `1px solid ${d.statusColor}50`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Section */}
        {completedDossiers.length > 0 && (
          <div className="mb-8" style={{ marginTop: '48px' }}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest" style={{ color: '#00e5ff', letterSpacing: '0.15em' }}>
                COMPLETED
              </h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #00e5ff 0%, transparent 100%)' }} />
            </div>

            <div className="space-y-4">
              {completedDossiers.map((d) => (
                <Link
                  key={d.id}
                  to="/dossier/$jobId"
                  params={{ jobId: d.id }}
                  className="block hover:glow-success"
                  style={{
                    background: '#0c1019',
                    border: `1px solid ${d.borderColor}`,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s',
                    padding: '20px',
                    marginBottom: '16px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2" style={{ color: '#e0e8f8', fontSize: '18px', lineHeight: '1.3' }}>
                        {d.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '15px' }}>
                        <span style={{ color: '#7a8aaa' }}>{d.stage}</span>
                        <span style={{ color: '#3a4560' }}>·</span>
                        <TierLabel tier={d.tier} />
                        <span style={{ color: '#3a4560' }}>·</span>
                        <span style={{ color: '#7a8aaa' }}>{d.cost}</span>
                        <span style={{ color: '#3a4560' }}>·</span>
                        <span style={{ color: '#7a8aaa' }}>{d.checks} checks</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: `${d.statusColor}12`,
                          color: d.statusColor,
                          border: `1px solid ${d.statusColor}50`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ✓ {d.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="font-mono tracking-wide" style={{ color: '#4a5a7a', fontSize: '11px' }}>
          HUXL · OUTCOME, ENGINEERED
        </p>
      </div>
    </div>
  )
}

function TierLabel({ tier }: { tier: string }) {
  const colors: Record<string, string> = { B: '#7a8aaa', A: '#00e5ff', S: '#ff9500' }
  return (
    <span style={{ color: colors[tier] || '#7a8aaa', fontWeight: 700, fontSize: '13px' }}>
      Tier {tier}
    </span>
  )
}
