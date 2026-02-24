import { useState, Suspense } from 'react'
import { useParams } from '@tanstack/react-router'
import { mockProject, mockQuestions, mockMessages, mockDelegationLinks } from '~/mocks/concierge-mock'
import { ConversationThread } from '~/components/concierge/ConversationThread'
import type { Question } from '~/types/concierge'

function DelegateViewInner() {
  const params = useParams({ strict: false }) as { token?: string }
  const token = params.token ?? ''
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const delegation = mockDelegationLinks.find((d) => d.token === token)

  if (delegation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger mb-2">Invalid Link</h1>
          <p className="text-muted text-sm">This delegation link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (delegation.revoked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warning mb-2">Link Revoked</h1>
          <p className="text-muted text-sm">This delegation link has been revoked by the project owner.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-success mb-2">Thank You</h1>
          <p className="text-muted text-sm">Your answers have been submitted to the project owner.</p>
        </div>
      </div>
    )
  }

  const isFullHandoff = delegation.scope === 'full'
  const relevantQuestions: Question[] = isFullHandoff
    ? mockQuestions.filter((q) => q.status !== 'answered')
    : mockQuestions.filter((q) => delegation.question_ids.includes(q.id))

  const handleSubmit = () => {
    const allAnswered = relevantQuestions.every((q) => (answers[q.id] ?? '').trim().length > 0)
    if (!allAnswered) return
    setSubmitted(true)
  }

  const updateAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-border flex items-center gap-3">
        <span className="text-accent font-mono text-lg font-bold tracking-tight">H</span>
        <span className="text-text font-medium">{mockProject.name}</span>
        <span className="ml-auto text-xs font-mono bg-purple/15 text-purple px-2 py-0.5 rounded">
          Delegate View
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {isFullHandoff && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ConversationThread messages={mockMessages} />
          </div>
        )}

        <div className="p-6 space-y-6">
          {!isFullHandoff && (
            <p className="text-sm text-muted">
              You&apos;ve been asked to help answer {relevantQuestions.length === 1 ? 'a question' : `${relevantQuestions.length} questions`} for this project.
            </p>
          )}

          {relevantQuestions.map((q) => (
            <div key={q.id} className="border border-border rounded-lg p-4 bg-card">
              <p className="text-sm font-medium text-text mb-1">{q.text}</p>
              <p className="text-xs text-muted mb-3 pl-2 border-l-2 border-accent/30">{q.context}</p>
              <textarea
                value={answers[q.id] ?? ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                rows={3}
                placeholder="Your answer…"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={relevantQuestions.some((q) => (answers[q.id] ?? '').trim().length === 0)}
            className="w-full py-2.5 bg-accent/15 text-accent text-sm rounded hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit {relevantQuestions.length === 1 ? 'Answer' : 'Answers'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DelegateView() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted">Loading…</div>}>
      <DelegateViewInner />
    </Suspense>
  )
}
