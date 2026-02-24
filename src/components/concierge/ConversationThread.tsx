import { useEffect, useRef } from 'react'
import type { ConversationMessage } from '~/types/concierge'

interface ConversationThreadProps {
  messages: ReadonlyArray<ConversationMessage>
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  if (msg.role === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-muted bg-card px-3 py-1 rounded-full border border-border">
          {msg.content}
        </span>
      </div>
    )
  }

  const isLeft = msg.role === 'concierge'
  const isDelegate = msg.role === 'delegate'

  return (
    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isLeft
            ? 'bg-accent/10 border border-accent/20 text-text'
            : isDelegate
              ? 'bg-purple/10 border border-purple/20 text-text'
              : 'bg-card border border-border text-text'
        }`}
      >
        {isDelegate && msg.author_name && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono bg-purple/20 text-purple px-1.5 py-0.5 rounded">
              {msg.author_name}
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <span className="block text-[10px] text-muted mt-1.5">{formatTime(msg.created_at)}</span>
      </div>
    </div>
  )
}

export function ConversationThread({ messages }: ConversationThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        No messages yet. The concierge will start the conversation.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
      <div ref={endRef} />
    </div>
  )
}
