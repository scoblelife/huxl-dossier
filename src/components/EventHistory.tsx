import { useState } from 'react'
import type { Dossier, EventType } from '~/types/dossier'

interface Event {
  id: number
  type: EventType
  timestamp: string
  duration: number | null
  stage: string
  attempt: number
  result: string | null
  tokens: { in: number; out: number }
  cost: number
  model: string
  artifact: string | null
  context: Array<{ kind: string; content: string }>
}

export function EventHistory({ dossier, limit }: { dossier: Dossier; limit?: number }) {
  const events = buildEventHistory(dossier)
  const displayEvents = limit ? events.slice(-limit) : events

  return (
    <div style={{ background: '#0c1019', border: '1px solid #1c2640', borderRadius: '10px' }}>
      <div style={{ borderBottom: '1px solid #1c2640', padding: '20px' }} className="sm:p-8">
        <h2 className="text-lg font-semibold" style={{ color: '#e0e8f8' }}>Event History</h2>
        <p className="text-sm mt-2" style={{ color: '#546080' }}>
          Chronological log of all lifecycle activities • {events.length} total events
        </p>
      </div>

      <div style={{ borderTop: '1px solid #1c2640' }}>
        {displayEvents.length === 0 ? (
          <div className="text-center" style={{ color: '#546080', padding: '20px' }}>
            No events yet. Lifecycle is initializing...
          </div>
        ) : (
          displayEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))
        )}
      </div>

      {limit && events.length > limit && (
        <div className="text-center text-sm" style={{ borderTop: '1px solid #1c2640', color: '#546080', padding: '16px 20px' }}>
          Showing last {limit} of {events.length} events
        </div>
      )}
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false)

  const typeColors: Record<string, string> = {
    StageStarted: 'text-blue-400',
    StageCompleted: 'text-success',
    StageFailed: 'text-danger',
    StageRetrying: 'text-warning',
    GateRejected: 'text-warning',
    CustomerEscalation: 'text-danger',
  }

  const typeIcons: Record<string, string> = {
    StageStarted: '▶',
    StageCompleted: '✓',
    StageFailed: '✕',
    StageRetrying: '↻',
    GateRejected: '↶',
    CustomerEscalation: '⚠️',
  }

  return (
    <div style={{ borderBottom: '1px solid #1c2640' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', padding: '20px' }}
      >
        <div className="flex items-start gap-2 sm:gap-4">
          <div className="flex-shrink-0 w-8 sm:w-12 text-right text-xs sm:text-sm text-gray-500 font-mono">
            #{event.id}
          </div>

          <div className="flex-shrink-0 w-5 sm:w-6 text-center">
            <span className={typeColors[event.type] || 'text-gray-400'}>{typeIcons[event.type] || '○'}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <span className={`text-sm font-medium ${typeColors[event.type] || 'text-gray-400'}`}>
                {event.type}
              </span>
              <span className="text-gray-400 hidden sm:inline">·</span>
              <code className="text-xs sm:text-sm text-accent">{event.stage}</code>
              {event.attempt > 1 && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm text-warning">Attempt {event.attempt}</span>
                </>
              )}
              {event.duration !== null && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm text-gray-400">{formatDuration(event.duration)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              {event.result && <span>Result: {event.result}</span>}
              {event.tokens.in > 0 && (
                <span>
                  {event.tokens.in.toLocaleString()} → {event.tokens.out.toLocaleString()} tokens
                </span>
              )}
              {event.cost > 0 && <span>${event.cost.toFixed(4)}</span>}
            </div>
          </div>

          <div className="flex-shrink-0 text-gray-400">
            {expanded ? '▼' : '▶'}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="space-y-5" style={{ borderTop: '1px solid rgba(28, 38, 64, 0.5)', padding: '20px' }}>
          {event.model && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Model</div>
              <code className="text-sm text-accent">{event.model}</code>
            </div>
          )}

          {event.artifact && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Artifact Summary</div>
              <div className="text-sm bg-bg rounded border border-border" style={{ padding: '16px' }}>
                {event.artifact}
              </div>
            </div>
          )}

          {event.context.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-3">Context Additions ({event.context.length})</div>
              <div className="space-y-3">
                {event.context.map((ctx, idx) => (
                  <div key={idx} className="bg-bg rounded border border-border" style={{ padding: '16px' }}>
                    <div className="text-xs text-warning mb-2">{ctx.kind}</div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {ctx.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function buildEventHistory(dossier: Dossier): Event[] {
  const events: Event[] = []
  let eventId = 1

  for (const entry of dossier.pipeline_timeline) {
    events.push({
      id: eventId++,
      type: 'StageStarted',
      timestamp: entry.started_at,
      duration: null,
      stage: entry.stage,
      attempt: entry.attempt,
      result: null,
      tokens: { in: 0, out: 0 },
      cost: 0,
      model: '',
      artifact: null,
      context: [],
    })

    if (entry.ended_at) {
      const duration = new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()

      let eventType: EventType = 'StageCompleted'
      if (entry.result === 'Retry') eventType = 'StageRetrying'
      else if (entry.result === 'Rejected' || entry.result === 'GateFail') eventType = 'StageFailed'

      events.push({
        id: eventId++,
        type: eventType,
        timestamp: entry.ended_at,
        duration,
        stage: entry.stage,
        attempt: entry.attempt,
        result: entry.result || 'Unknown',
        tokens: { in: entry.tokens_in, out: entry.tokens_out },
        cost: entry.cost_usd,
        model: entry.model,
        artifact: entry.artifact_summary,
        context: entry.context_additions,
      })
    }
  }

  // Add gate events
  for (const gate of (dossier.gate_events || [])) {
    if (gate.result === 'Reject') {
      events.push({
        id: eventId++,
        type: 'GateRejected',
        timestamp: gate.timestamp,
        duration: null,
        stage: gate.gate,
        attempt: 0,
        result: 'Rejected',
        tokens: { in: 0, out: 0 },
        cost: 0,
        model: '',
        artifact: gate.summary,
        context: [],
      })
    }
  }

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  events.forEach((e, idx) => { e.id = idx + 1 })

  return events
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}
