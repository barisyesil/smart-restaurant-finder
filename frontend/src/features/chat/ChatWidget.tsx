import { Loader2, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, suggestions, send, isPending } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Yeni mesaj/yanıt geldikçe listeyi en alta kaydır (setState değil, salt DOM — effect-safe).
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, isPending])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    send(draft)
    setDraft('')
  }

  if (!open) {
    return (
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="AI asistanını aç"
        className="fixed bottom-4 right-4 z-[60] h-14 w-14 rounded-full shadow-lg"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex h-[min(560px,80vh)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:w-96">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Akıllı Asistan</p>
            <p className="text-xs text-muted-foreground">Doğal dille filtrele</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setOpen(false)}
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm bg-muted text-foreground',
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Düşünüyor…
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !isPending && (
        <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Bir şeyler yaz…"
          disabled={isPending}
          autoFocus
        />
        <Button type="submit" size="icon" disabled={isPending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
