import { Loader2, Send, Sparkles, Star, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { PlaceRecommendation } from '@/api/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from '@/hooks/useChat'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatDistance, formatPriceLevel, getCategoryMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { RecommendedPlace } from '@/types/place'

interface ChatWidgetProps {
  places: RecommendedPlace[]
}

function RecommendationCard({
  recommendation,
  place,
  onOpen,
}: {
  recommendation: PlaceRecommendation
  place: RecommendedPlace | undefined
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const meta = getCategoryMeta(place?.category ?? '')
  const Icon = meta.Icon
  const label = place ? t(`categories.${place.category}`) : t('categories.place')
  const price = formatPriceLevel(place?.price_level ?? null, t('price.free'))

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-1 rounded-xl border bg-background p-2.5 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 truncate text-sm font-semibold">{place?.name ?? 'Mekan'}</span>
        {place?.rating != null && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {place.rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-xs leading-snug text-muted-foreground">{recommendation.reason}</p>
      {place && (
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <span>{label}</span>
          <span>· {formatDistance(place.distance_m)}</span>
          {price && <span>· {price}</span>}
        </div>
      )}
    </button>
  )
}

export function ChatWidget({ places }: ChatWidgetProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const { messages, suggestions, send, isPending } = useChat(places)
  const selectPlace = useAppStore((state) => state.selectPlace)
  const open = useAppStore((state) => state.chatOpen)
  const setOpen = useAppStore((state) => state.setChatOpen)
  const sheetOpen = useAppStore((state) => state.sheetOpen)
  const isMobile = useIsMobile()
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

  // Launcher: yuvarlak FAB yerine karşılama metinli "pill". Masaüstünde sağ-altta
  // (harita zoom kontrolü sola alındı), mobilde alt bottom-sheet'in peek'inin üstünde.
  if (!open) {
    // Mobilde içerik paneli açıkken pill'i gizle — üstüne binmesin.
    if (isMobile && sheetOpen) return null
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-[60] flex items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-primary-foreground shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 sm:bottom-5 sm:right-5"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/40" />
          <Sparkles className="relative h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">{t('chat.launcher')}</span>
      </button>
    )
  }

  return (
    <>
      {/* Mobilde arka planı karart (panel'i bottom-sheet'ten ayırır, dokunma çakışmasını önler) */}
      <div
        className="fixed inset-0 z-[65] bg-black/40 sm:hidden"
        onClick={() => setOpen(false)}
      />

      <div className="fixed inset-x-0 bottom-0 z-[70] flex h-[88vh] flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[min(560px,80vh)] sm:w-96 sm:rounded-2xl">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{t('chat.title')}</p>
              <p className="text-xs text-muted-foreground">{t('chat.subtitle')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOpen(false)}
            aria-label={t('chat.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
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
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="space-y-1.5">
                  {message.recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.place_id}
                      recommendation={recommendation}
                      place={places.find((place) => place.id === recommendation.place_id)}
                      onOpen={() => {
                        selectPlace(recommendation.place_id)
                        setOpen(false)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('chat.thinking')}
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
            placeholder={t('chat.placeholder')}
            disabled={isPending}
            enterKeyHint="send"
          />
          <Button type="submit" size="icon" disabled={isPending || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  )
}
