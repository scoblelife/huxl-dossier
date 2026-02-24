import { useState } from 'react'
import type { DiscoveryBrief } from '~/types/concierge'

interface DiscoveryBriefPanelProps {
  brief: DiscoveryBrief | null
  onQuestionClick?: (questionId: string) => void
}

export function DiscoveryBriefPanel({ brief, onQuestionClick }: DiscoveryBriefPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (brief === null) {
    return (
      <div className="border-l border-border p-4 text-sm text-muted w-72 shrink-0 hidden lg:block">
        Brief will appear as questions are answered…
      </div>
    )
  }

  const confidencePct = Math.round(brief.confidence * 100)

  return (
    <div className={`border-l border-border shrink-0 hidden lg:flex flex-col transition-all duration-300 ${collapsed ? 'w-10' : 'w-80'}`}>
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="px-3 py-2 text-xs text-muted hover:text-accent border-b border-border text-left transition-colors"
      >
        {collapsed ? '▶' : '◀ Discovery Brief'}
      </button>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Summary */}
          <div>
            <h4 className="text-xs text-muted uppercase tracking-wide mb-1">Summary</h4>
            <p className="text-text leading-relaxed">{brief.summary}</p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-xs text-muted uppercase tracking-wide mb-1">
              Requirements ({brief.requirements.length})
            </h4>
            <ul className="space-y-1">
              {brief.requirements.map((req) => (
                <li key={req.id} className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5 shrink-0">›</span>
                  <span className="text-text">
                    {req.text}
                    {onQuestionClick && (
                      <button
                        onClick={() => onQuestionClick(req.source_question_id)}
                        className="ml-1 text-[10px] text-muted hover:text-accent transition-colors"
                        title="Jump to source question"
                      >
                        ↗
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraints */}
          {brief.constraints.length > 0 && (
            <div>
              <h4 className="text-xs text-muted uppercase tracking-wide mb-1">Constraints</h4>
              <ul className="space-y-1">
                {brief.constraints.map((c, i) => (
                  <li key={i} className="text-muted flex items-start gap-1.5">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Open Questions */}
          {brief.open_questions.length > 0 && (
            <div>
              <h4 className="text-xs text-muted uppercase tracking-wide mb-1">Open Questions</h4>
              <ul className="space-y-1">
                {brief.open_questions.map((q, i) => (
                  <li key={i} className="text-muted text-xs">• {q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-muted uppercase tracking-wide">Confidence</h4>
              <span className="text-xs text-accent font-mono">{confidencePct}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>

          {/* Keep note */}
          <p className="text-[10px] text-muted/60 italic border-t border-border pt-3">
            This brief is yours to keep, even if you don't proceed.
          </p>
        </div>
      )}
    </div>
  )
}
