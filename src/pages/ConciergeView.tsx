import { useState, useCallback, Suspense } from 'react'
import { useParams } from '@tanstack/react-router'
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

function ConciergeViewInner() {
  const params = useParams({ strict: false }) as { projectId?: string }
  const projectId = params.projectId ?? mockProject.id

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
    (scope: DelegationScope, questionIds: string[], expiryDays: number, reusable: boolean) => {
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
        max_uses: reusable ? null : 1,
      }
      setDelegationLinks((prev) => [...prev, newLink])
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
      <div className="px-6 py-3 border-b border-border flex items-center gap-3">
        <span className="text-accent font-mono text-lg font-bold tracking-tight">H</span>
        <span className="text-text font-medium">{project.name}</span>
        <span className="ml-auto text-xs font-mono text-muted">{projectId}</span>
      </div>

      <ProgressBar phase={project.phase} questions={questions} projectName={project.name} />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <ConversationThread messages={messages} />
          <QuestionCard
            question={activeQuestion}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onDelegate={handleDelegateOpen}
          />
        </div>
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

export default function ConciergeView() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted">Loading…</div>}>
      <ConciergeViewInner />
    </Suspense>
  )
}
