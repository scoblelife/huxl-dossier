import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { ConversationThread } from '~/components/concierge/ConversationThread'
import { QuestionCard } from '~/components/concierge/QuestionCard'
import { ProgressBar } from '~/components/concierge/ProgressBar'
import { DiscoveryBriefPanel } from '~/components/concierge/DiscoveryBriefPanel'
import { DelegationModal } from '~/components/concierge/DelegationModal'
import {
  mockProject,
  mockMessages,
  mockQuestions,
  mockBrief,
  mockDelegationLinks,
} from '~/mocks/concierge-mock'
import type { ConversationMessage, Question, DelegationLink, DelegationScope } from '~/types/concierge'

export const Route = createFileRoute('/concierge/$projectId')({
  component: ConciergeView,
})

function ConciergeView() {
  const { projectId } = Route.useParams()

  // Local state seeded from mocks
  const [messages, setMessages] = useState<ConversationMessage[]>([...mockMessages])
  const [questions, setQuestions] = useState<Question[]>([...mockQuestions])
  const [delegationLinks, setDelegationLinks] = useState<DelegationLink[]>([...mockDelegationLinks])
  const [delegationOpen, setDelegationOpen] = useState(false)
  const [_delegationTarget, setDelegationTarget] = useState<string | null>(null)

  const project = { ...mockProject, id: projectId }
  const brief = mockBrief

  const activeQuestion = questions.find((q) => q.status === 'active') ?? null

  const handleSubmit = useCallback((questionId: string, answer: string) => {
    const now = new Date().toISOString()
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, status: 'answered' as const, answer, answered_by: 'owner', answered_at: now }
          : q
      )
    )
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        project_id: projectId,
        role: 'customer' as const,
        content: answer,
        question_id: questionId,
        created_at: now,
        author_name: null,
      },
    ])
    // Activate next pending question
    setQuestions((prev) => {
      const next = prev.find((q) => q.status === 'pending')
      if (next === undefined) return prev
      return prev.map((q) => (q.id === next.id ? { ...q, status: 'active' as const } : q))
    })
  }, [projectId])

  const handleSkip = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, status: 'skipped' as const } : q))
    )
    setQuestions((prev) => {
      const next = prev.find((q) => q.status === 'pending')
      if (next === undefined) return prev
      return prev.map((q) => (q.id === next.id ? { ...q, status: 'active' as const } : q))
    })
  }, [])

  const handleDelegateOpen = useCallback((questionId: string) => {
    setDelegationTarget(questionId)
    setDelegationOpen(true)
  }, [])

  const handleGenerate = useCallback(
    (scope: DelegationScope, questionIds: string[], expiryDays: number, _reusable: boolean) => {
      const now = new Date()
      const expires = new Date(now.getTime() + expiryDays * 86400000)
      const token = `del_${Date.now()}`
      const newLink: DelegationLink = {
        token,
        project_id: projectId,
        scope,
        question_ids: questionIds,
        expires_at: expires.toISOString(),
        created_at: now.toISOString(),
        revoked: false,
        uses: 0,
        max_uses: _reusable ? null : 1,
      }
      setDelegationLinks((prev) => [...prev, newLink])
      // Mark questions as delegated
      if (questionIds.length > 0) {
        setQuestions((prev) =>
          prev.map((q) =>
            questionIds.includes(q.id)
              ? {
                  ...q,
                  status: 'delegated' as const,
                  delegation: { scope, token, expires_at: expires.toISOString(), delegate_name: null, revoked: false },
                }
              : q
          )
        )
      }
    },
    [projectId]
  )

  const handleRevoke = useCallback((token: string) => {
    setDelegationLinks((prev) => prev.map((d) => (d.token === token ? { ...d, revoked: true } : d)))
  }, [])

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3">
        <span className="text-accent font-mono text-lg font-bold tracking-tight">H</span>
        <span className="text-text font-medium">{project.name}</span>
        <span className="ml-auto text-xs font-mono text-muted">{projectId}</span>
      </div>

      <ProgressBar phase={project.phase} questions={questions} projectName={project.name} />

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: conversation + question */}
        <div className="flex-1 flex flex-col min-w-0">
          <ConversationThread messages={messages} />
          <QuestionCard
            question={activeQuestion}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onDelegate={handleDelegateOpen}
          />
        </div>

        {/* Right: brief */}
        <DiscoveryBriefPanel brief={brief} />
      </div>

      <DelegationModal
        isOpen={delegationOpen}
        onClose={() => setDelegationOpen(false)}
        activeQuestionId={activeQuestion?.id ?? null}
        questions={questions}
        delegationLinks={delegationLinks}
        onGenerate={handleGenerate}
        onRevoke={handleRevoke}
      />
    </div>
  )
}
