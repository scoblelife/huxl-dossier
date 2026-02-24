import { useState } from 'react'
import type { Question } from '~/types/concierge'

interface QuestionCardProps {
  question: Question | null
  onSubmit: (questionId: string, answer: string) => void
  onSkip: (questionId: string) => void
  onDelegate: (questionId: string) => void
}

export function QuestionCard({ question, onSubmit, onSkip, onDelegate }: QuestionCardProps) {
  const [answer, setAnswer] = useState('')
  const [showContext, setShowContext] = useState(false)

  if (question === null) {
    return (
      <div className="border-t border-border px-4 py-6 text-center text-muted text-sm">
        All questions answered or delegated. Waiting for responses…
      </div>
    )
  }

  const handleSubmit = () => {
    const trimmed = answer.trim()
    if (trimmed.length === 0) return
    onSubmit(question.id, trimmed)
    setAnswer('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border px-4 py-4 bg-card/50">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-text">{question.text}</p>
        <button
          onClick={() => setShowContext((p) => !p)}
          className="ml-2 shrink-0 text-[10px] text-muted hover:text-accent border border-border rounded px-1.5 py-0.5 transition-colors"
          title="Why we're asking this"
        >
          ?
        </button>
      </div>
      {showContext && (
        <p className="text-xs text-muted mb-2 pl-2 border-l-2 border-accent/30">{question.context}</p>
      )}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Type your answer… (⌘+Enter to submit)"
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={answer.trim().length === 0}
          className="px-4 py-1.5 bg-accent/15 text-accent text-sm rounded hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Submit
        </button>
        <button
          onClick={() => onDelegate(question.id)}
          className="px-4 py-1.5 bg-purple/15 text-purple text-sm rounded hover:bg-purple/25 transition-colors"
        >
          Delegate
        </button>
        <button
          onClick={() => onSkip(question.id)}
          className="ml-auto text-xs text-muted hover:text-text transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
