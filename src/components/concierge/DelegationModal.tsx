import { useState } from 'react'
import type { Question, DelegationScope, DelegationLink } from '~/types/concierge'

interface DelegationModalProps {
  isOpen: boolean
  onClose: () => void
  activeQuestionId: string | null
  questions: ReadonlyArray<Question>
  delegationLinks: ReadonlyArray<DelegationLink>
  onGenerate: (scope: DelegationScope, questionIds: string[], expiryDays: number, reusable: boolean) => void
  onRevoke: (token: string) => void
}

const EXPIRY_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
] as const

export function DelegationModal({
  isOpen,
  onClose,
  activeQuestionId,
  questions,
  delegationLinks,
  onGenerate,
  onRevoke,
}: DelegationModalProps) {
  const [scope, setScope] = useState<DelegationScope>('single')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expiryDays, setExpiryDays] = useState(7)
  const [reusable, setReusable] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const unanswered = questions.filter((q) => q.status === 'pending' || q.status === 'active')

  const handleGenerate = () => {
    const ids = scope === 'single' && activeQuestionId
      ? [activeQuestionId]
      : scope === 'batch'
        ? selectedIds
        : []
    onGenerate(scope, ids, expiryDays, reusable)
    const fakeToken = `del_${Date.now()}`
    setGeneratedUrl(`${window.location.origin}/delegate/${fakeToken}`)
  }

  const handleCopy = () => {
    if (generatedUrl === null) return
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const activeDelegations = delegationLinks.filter((d) => !d.revoked)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text">Delegate Questions</h3>
          <button onClick={onClose} className="text-muted hover:text-text text-xl leading-none">&times;</button>
        </div>

        {generatedUrl === null ? (
          <>
            {/* Scope selection */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-muted uppercase tracking-wide">Scope</label>
              {(['single', 'batch', 'full'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                    scope === s ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border text-muted hover:text-text'
                  }`}
                >
                  {s === 'single' ? 'Just this question' : s === 'batch' ? 'Select questions' : 'Hand off entire interview'}
                </button>
              ))}
            </div>

            {/* Batch selection */}
            {scope === 'batch' && (
              <div className="mb-4 space-y-1">
                <label className="text-xs text-muted uppercase tracking-wide">Select questions</label>
                {unanswered.map((q) => (
                  <label key={q.id} className="flex items-start gap-2 text-sm text-text cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleQuestion(q.id)}
                      className="mt-0.5 accent-accent"
                    />
                    <span>{q.text}</span>
                  </label>
                ))}
                {unanswered.length === 0 && <p className="text-xs text-muted">No unanswered questions</p>}
              </div>
            )}

            {/* Expiry */}
            <div className="mb-4">
              <label className="text-xs text-muted uppercase tracking-wide block mb-1">Expires in</label>
              <div className="flex gap-2">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => setExpiryDays(opt.days)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      expiryDays === opt.days ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reusable */}
            <label className="flex items-center gap-2 text-sm text-muted mb-4 cursor-pointer">
              <input type="checkbox" checked={reusable} onChange={(e) => setReusable(e.target.checked)} className="accent-accent" />
              Reusable link (multiple people can use it)
            </label>

            <button
              onClick={handleGenerate}
              className="w-full py-2 bg-accent/15 text-accent text-sm rounded hover:bg-accent/25 transition-colors"
            >
              Generate Link
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">Share this link with your delegate:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={generatedUrl}
                className="flex-1 bg-bg border border-border rounded px-3 py-2 text-xs text-text font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-accent/15 text-accent text-xs rounded hover:bg-accent/25 transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setGeneratedUrl(null)}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              ← Generate another
            </button>
          </div>
        )}

        {/* Active delegations */}
        {activeDelegations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs text-muted uppercase tracking-wide mb-2">Active Delegations</h4>
            {activeDelegations.map((d) => (
              <div key={d.token} className="flex items-center justify-between py-2 text-sm">
                <span className="text-text font-mono text-xs">{d.token.slice(0, 16)}…</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{d.scope}</span>
                  <button
                    onClick={() => onRevoke(d.token)}
                    className="text-xs text-danger hover:text-danger/80 transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
