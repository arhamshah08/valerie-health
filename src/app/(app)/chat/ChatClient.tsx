'use client'
import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STARTERS = [
  "Why do I get hot flashes at night but not during the day?",
  "What can I do about the brain fog?",
  "How should I talk to my doctor about HRT?",
  "Is what I'm feeling normal?",
]

interface Props {
  profile: { stage: string | null; top_symptoms: string[]; goals: string[] } | null
  recentCheckIns: Record<string, unknown>[]
}

export default function ChatClient({ profile, recentCheckIns }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const contextBody = JSON.stringify({ profile, recentCheckIns })

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: { context: contextBody },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi — I'm Valerie. I'm here whenever you need to talk through what's happening, understand a symptom, or prepare for a conversation with your doctor.\n\nI know this can feel a lot some days. You don't have to figure it out alone. What's on your mind?`,
      },
    ],
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg">
            🌸
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Valerie</h1>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Always here
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 scrollbar-hide">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-sm shrink-0 mr-2 mt-0.5">
                🌸
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-sm shrink-0 mr-2">
              🌸
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-5 py-3">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts (only on first message after welcome) */}
      {messages.length === 1 && (
        <div className="px-4 md:px-8 pb-3 shrink-0">
          <p className="text-xs text-gray-400 font-medium mb-2">Common questions:</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => append({ role: 'user', content: s })}
                className="text-xs px-3 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 font-medium hover:bg-violet-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 md:px-8 py-4 border-t border-gray-100 bg-white shrink-0 pb-20 md:pb-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Valerie anything…"
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="shrink-0 px-5">
            Send
          </Button>
        </form>
        <p className="text-[10px] text-gray-300 text-center mt-2">
          Valerie is not a medical provider. Always consult your doctor for clinical decisions.
        </p>
      </div>
    </div>
  )
}
