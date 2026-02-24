import { useState, useEffect, useRef, useCallback } from 'react'
import type { Dossier, WallSteepness } from '~/types/dossier'

interface DslBlock {
  type: 'service' | 'storage' | 'constraint'
  name: string
  details: string[]
  connections: string[]
  props: Record<string, string>
}

/** Known properties we display as icon+value badges */
const PROP_ICONS: Record<string, { icon: string; label: string }> = {
  // Runtime
  container: { icon: '🐳', label: 'Container' },
  vm: { icon: '🖥️', label: 'VM' },
  serverless: { icon: '⚡', label: 'Serverless' },
  // Language
  rust: { icon: '🦀', label: 'Rust' },
  typescript: { icon: '🟦', label: 'TypeScript' },
  python: { icon: '🐍', label: 'Python' },
  go: { icon: '🐹', label: 'Go' },
  java: { icon: '☕', label: 'Java' },
  // Backend / storage
  postgres: { icon: '🐘', label: 'Postgres' },
  redis: { icon: '🔴', label: 'Redis' },
  sqlite: { icon: '📦', label: 'SQLite' },
  s3: { icon: '🪣', label: 'S3' },
}

/** Extract key=value props from detail lines */
function extractProps(details: string[]): Record<string, string> {
  const props: Record<string, string> = {}
  for (const line of details) {
    const match = line.match(/^(runtime|language|backend)\s+(.+)$/)
    if (match) {
      props[match[1]] = match[2].trim()
    }
  }
  return props
}

function parseDsl(raw: string): DslBlock[] {
  const blocks: DslBlock[] = []
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  let current: DslBlock | null = null

  for (const line of lines) {
    const serviceMatch = line.match(/^service\s+(\w+)/)
    const storageMatch = line.match(/^storage\s+(\w+)/)
    const constraintMatch = line.match(/^constraint\s+(\w+)/)

    if (serviceMatch) {
      if (current) { current.props = extractProps(current.details); blocks.push(current) }
      current = { type: 'service', name: serviceMatch[1], details: [], connections: [], props: {} }
    } else if (storageMatch) {
      if (current) { current.props = extractProps(current.details); blocks.push(current) }
      current = { type: 'storage', name: storageMatch[1], details: [], connections: [], props: {} }
    } else if (constraintMatch) {
      if (current) { current.props = extractProps(current.details); blocks.push(current) }
      current = { type: 'constraint', name: constraintMatch[1], details: [], connections: [], props: {} }
    } else if (current) {
      const depMatch = line.match(/^(?:depends_on|uses|reads|writes)\s+(\w+)/)
      if (depMatch) {
        current.connections.push(depMatch[1])
      }
      if (line !== '{' && line !== '}') {
        current.details.push(line)
      }
    }
  }
  if (current) { current.props = extractProps(current.details); blocks.push(current) }
  return blocks
}

/** Convert details to YAML for popover display */
function detailsToYaml(details: string[]): string {
  return details.map((line) => {
    const kvMatch = line.match(/^(\w[\w_]*)\s+(.+)$/)
    if (kvMatch) {
      const [, key, val] = kvMatch
      if (val.includes('{')) {
        const inner = val.replace(/[{}]/g, '').trim()
        if (inner.includes(',')) {
          const items = inner.split(',').map((s) => s.trim()).filter(Boolean)
          return `${key}:\n${items.map((item) => `  - ${item}`).join('\n')}`
        }
        return `${key}: ${inner}`
      }
      if (val.includes('->')) return `${key}: ${val.replace('->', '→').trim()}`
      return `${key}: ${val}`
    }
    return line
  }).join('\n')
}

const BLOCK_STYLES: Record<DslBlock['type'], { border: string; glow: string; icon: string; label: string }> = {
  service: { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.15)', icon: '⚡', label: 'SERVICE' },
  storage: { border: '#ff9500', glow: 'rgba(255, 149, 0, 0.15)', icon: '▣', label: 'STORAGE' },
  constraint: { border: '#c472ff', glow: 'rgba(196, 114, 255, 0.15)', icon: '◆', label: 'CONSTRAINT' },
}

const STEEPNESS_LEVELS: WallSteepness[] = ['Gentle', 'Moderate', 'Steep', 'Sheer']
const STEEPNESS_COLORS: Record<WallSteepness, string> = {
  Gentle: '#00dfa2',
  Moderate: '#00e5ff',
  Steep: '#ff9500',
  Sheer: '#ff3838',
}

export function HuxlDslViz({ dossier }: { dossier: Dossier }) {
  const hasDsl = !!dossier.huxl_dsl
  const blocks = hasDsl ? parseDsl(dossier.huxl_dsl!) : []
  const blockNames = new Set(blocks.map((b) => b.name))
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* huxl-dsl block diagram */}
      {hasDsl && (
        <div>
          <h3 style={{ color: '#7a8aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '20px', textTransform: 'uppercase' }}>
            HUXL-DSL SPEC
          </h3>
          <div
            style={{
              background: '#0c1019',
              border: '1px solid #1c2640',
              borderRadius: '10px',
              padding: '28px',
            }}
          >
            {/* Visual block grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              {blocks.map((block) => {
                const s = BLOCK_STYLES[block.type]
                const isExpanded = expandedBlock === block.name

                // Common property badges (runtime, language, backend)
                const badges: Array<{ icon: string; label: string; value: string }> = []
                for (const [propKey, propVal] of Object.entries(block.props)) {
                  const iconInfo = PROP_ICONS[propVal.toLowerCase()]
                  if (iconInfo) {
                    badges.push({ ...iconInfo, value: propVal })
                  } else {
                    // Fallback: show text badge
                    const fallbackIcon = propKey === 'runtime' ? '⚙️' : propKey === 'language' ? '📝' : propKey === 'backend' ? '💾' : '📋'
                    badges.push({ icon: fallbackIcon, label: propKey, value: propVal })
                  }
                }

                // Non-common details (everything except runtime/language/backend/depends_on)
                const commonKeys = new Set(['runtime', 'language', 'backend'])
                const otherDetails = block.details.filter((d) => {
                  const key = d.match(/^(\w+)\s/)?.[1]
                  return key ? !commonKeys.has(key) && !d.startsWith('depends_on') : true
                })
                const hasMore = otherDetails.length > 0

                return (
                  <div
                    key={block.name}
                    style={{
                      flex: '1 1 200px',
                      maxWidth: '300px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        background: '#06080e',
                        border: `1px solid ${s.border}50`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: `0 0 20px ${s.glow}`,
                      }}
                    >
                      {/* Type header */}
                      <div style={{
                        padding: '10px 14px',
                        borderBottom: `1px solid ${s.border}30`,
                        background: `linear-gradient(to right, ${s.glow}, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{ fontSize: '14px' }}>{s.icon}</span>
                        <span style={{ fontSize: '10px', color: s.border, fontWeight: 700, letterSpacing: '0.1em' }}>{s.label}</span>
                      </div>

                      {/* Name + property badges */}
                      <div style={{ padding: '14px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#e0e8f8', marginBottom: badges.length > 0 ? '10px' : '0' }}>
                          {block.name}
                        </div>

                        {/* Icon badges for common properties */}
                        {badges.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: hasMore ? '8px' : '0' }}>
                            {badges.map((badge) => (
                              <span
                                key={badge.label}
                                title={`${badge.label}: ${badge.value}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(122, 138, 170, 0.1)',
                                  border: '1px solid rgba(122, 138, 170, 0.2)',
                                  fontSize: '11px',
                                  color: '#9ab0cc',
                                }}
                              >
                                <span style={{ fontSize: '13px' }}>{badge.icon}</span>
                                {badge.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* More button */}
                        {hasMore && (
                          <button
                            onClick={() => setExpandedBlock(isExpanded ? null : block.name)}
                            style={{
                              fontSize: '11px',
                              color: '#00e5ff',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                          >
                            +{otherDetails.length} more
                          </button>
                        )}
                      </div>

                      {/* Connections */}
                      {block.connections.filter((c) => blockNames.has(c)).length > 0 && (
                        <div style={{ padding: '8px 14px', borderTop: `1px solid ${s.border}20`, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {block.connections.filter((c) => blockNames.has(c)).map((c) => (
                            <span
                              key={c}
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: 'rgba(0, 229, 255, 0.1)',
                                color: '#00e5ff',
                                border: '1px solid rgba(0, 229, 255, 0.2)',
                              }}
                            >
                              → {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Popover with full YAML */}
                    {isExpanded && (
                      <BlockPopover
                        block={block}
                        style={s}
                        yaml={detailsToYaml(block.details)}
                        onClose={() => setExpandedBlock(null)}
                        blockNames={blockNames}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Raw DSL in collapsed code block */}
            <details style={{ marginTop: '8px' }}>
              <summary style={{ fontSize: '12px', color: '#546080', cursor: 'pointer', userSelect: 'none' }}>
                ▸ Raw huxl-dsl
              </summary>
              <pre style={{
                marginTop: '8px',
                padding: '16px',
                background: '#06080e',
                border: '1px solid #1c2640',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#7a8aaa',
                lineHeight: '1.6',
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre-wrap',
              }}>
                {dossier.huxl_dsl}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* Concierge prompt */}
      {dossier.concierge_prompt && (
        <div>
          <h3 style={{ color: '#7a8aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>
            CONCIERGE PROMPT
          </h3>
          <div style={{
            background: '#0c1019',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            borderLeft: '3px solid #00e5ff',
            borderRadius: '8px',
            padding: '20px 24px',
            fontSize: '14px',
            color: '#e0e8f8',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
          }}>
            {dossier.concierge_prompt}
          </div>
        </div>
      )}

      {/* Constraint profile as visual bars */}
      <div>
        <h3 style={{ color: '#7a8aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>
          CONSTRAINT PROFILE
        </h3>
        <div
          style={{
            background: '#0c1019',
            border: '1px solid #1c2640',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {(
            ['security', 'performance', 'compliance', 'ux_fidelity', 'data_safety'] as const
          ).map((key) => {
            const value = dossier.constraint_profile[key]
            const levelIdx = STEEPNESS_LEVELS.indexOf(value)
            const pct = ((levelIdx + 1) / STEEPNESS_LEVELS.length) * 100
            const color = STEEPNESS_COLORS[value]
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#e0e8f8' }}>{label}</span>
                  <span style={{ fontSize: '12px', color, fontWeight: 700 }}>{value}</span>
                </div>
                <div style={{ height: '6px', background: '#1c2640', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(to right, ${color}80, ${color})`,
                      borderRadius: '3px',
                      boxShadow: `0 0 8px ${color}40`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BlockPopover({
  block,
  style: s,
  yaml,
  onClose,
  blockNames,
}: {
  block: DslBlock
  style: { border: string; glow: string; icon: string; label: string }
  yaml: string
  onClose: () => void
  blockNames: Set<string>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        minWidth: '340px',
        maxWidth: '480px',
        background: '#06080e',
        border: `1px solid ${s.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: `0 0 40px ${s.glow}, 0 16px 48px rgba(0,0,0,0.7)`,
        animation: 'popoverIn 0.15s ease-out',
      }}
    >
      <style>{`
        @keyframes popoverIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${s.border}30`,
        background: `linear-gradient(to right, ${s.glow}, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>{s.icon}</span>
          <span style={{ fontSize: '10px', color: s.border, fontWeight: 700, letterSpacing: '0.1em' }}>{s.label}</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#7a8aaa', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
        >
          ✕
        </button>
      </div>
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#e0e8f8', marginBottom: '12px' }}>
          {block.name}
        </div>
        <pre style={{
          fontSize: '12px',
          color: '#9ab0cc',
          lineHeight: '1.8',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {yaml}
        </pre>
      </div>
      {block.connections.filter((c) => blockNames.has(c)).length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${s.border}20`, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {block.connections.filter((c) => blockNames.has(c)).map((c) => (
            <span
              key={c}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                background: 'rgba(0, 229, 255, 0.1)',
                color: '#00e5ff',
                border: '1px solid rgba(0, 229, 255, 0.2)',
              }}
            >
              → {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
