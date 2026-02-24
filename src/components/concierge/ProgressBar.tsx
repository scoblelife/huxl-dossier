import type { ProjectPhase, Question } from '~/types/concierge'

interface ProgressBarProps {
  phase: ProjectPhase
  questions: ReadonlyArray<Question>
  projectName: string
}

const PHASE_CONFIG: Record<ProjectPhase, { label: string; color: string; order: number }> = {
  discovering: { label: 'Discovering', color: 'bg-accent', order: 0 },
  'ready-to-scope': { label: 'Ready to Scope', color: 'bg-success', order: 1 },
  scoping: { label: 'Scoping', color: 'bg-success', order: 2 },
  forging: { label: 'Forging', color: 'bg-warning', order: 3 },
  delivered: { label: 'Delivered', color: 'bg-yellow-400', order: 4 },
}

export function ProgressBar({ phase, questions, projectName }: ProgressBarProps) {
  if (questions.length === 0) {
    return <div className="px-6 py-3 text-muted text-sm">No questions yet</div>
  }

  const answered = questions.filter((q) => q.status === 'answered').length
  const total = questions.length
  const pct = Math.round((answered / total) * 100)
  const cfg = PHASE_CONFIG[phase]

  return (
    <div className="px-6 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">
          Shaping <span className="text-text font-medium">{projectName}</span> — {answered} of ~{total} questions answered
        </span>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded ${
            cfg.order <= 1 ? 'bg-accent/15 text-accent' : cfg.order <= 3 ? 'bg-warning/15 text-warning' : 'bg-yellow-400/15 text-yellow-400'
          }`}
        >
          {cfg.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${cfg.color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
