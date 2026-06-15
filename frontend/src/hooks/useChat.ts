import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  sendChat,
  type ChatAction,
  type ChatContext,
  type ChatMessage,
  type PlaceRecommendation,
} from '@/api/chat'
import { geocode } from '@/api/geocode'
import i18n from '@/i18n'
import { useAppStore } from '@/store/useAppStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { useSavedPlacesStore, type SavedPlace } from '@/store/useSavedPlacesStore'
import type { RecommendedPlace } from '@/types/place'

export interface ChatBubble {
  role: 'user' | 'model'
  text: string
  recommendations?: PlaceRecommendation[]
}

/** Modelin döndürdüğü yapılandırılmış eylemleri store'a uygular.
 *  apply_filters'ta null alanlar mevcut değeri korur (artımlı güncelleme). */
async function applyActions(actions: ChatAction[]): Promise<void> {
  const prefs = usePreferencesStore.getState()
  for (const action of actions) {
    if (action.type === 'reset_filters') {
      prefs.reset()
    } else if (action.type === 'apply_filters') {
      const current = usePreferencesStore.getState()
      prefs.setAll({
        categories: action.categories ?? current.categories,
        cuisines: action.cuisines ?? current.cuisines,
        maxDistance: action.max_distance ?? current.maxDistance,
        maxPrice: action.max_price ?? current.maxPrice,
        openNow: action.open_now ?? current.openNow,
      })
    } else if (action.type === 'set_location' && action.location_query) {
      const results = await geocode(action.location_query)
      if (results.length > 0) {
        useAppStore.getState().setCustomLocation({ lat: results[0].lat, lon: results[0].lon })
        useAppStore.getState().selectPlace(null)
      }
    }
  }
}

function toSaved(places: SavedPlace[]): ChatContext['favorites'] {
  return places.map((place) => ({ id: place.id, name: place.name, category: place.category }))
}

function buildContext(places: RecommendedPlace[]): ChatContext {
  const prefs = usePreferencesStore.getState()
  const saved = useSavedPlacesStore.getState()
  return {
    locale: i18n.language,
    categories: prefs.categories,
    cuisines: prefs.cuisines,
    max_distance: prefs.maxDistance,
    max_price: prefs.maxPrice,
    open_now: prefs.openNow,
    has_location: useAppStore.getState().customLocation !== null,
    // Modelin önerebilmesi için görünür adayları kompakt gönder (ilk skorlama gerekçesiyle).
    places: places.slice(0, 20).map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      rating: place.rating,
      distance_m: place.distance_m,
      price_level: place.price_level,
      open_now: place.open_now,
      // Skorlama gerekçesi i18n anahtarıdır; Gemini'ye anlamlı (çevrilmiş) metin gönder.
      reason: place.reasons[0] ? i18n.t(`reasons.${place.reasons[0]}`) : null,
    })),
    favorites: toSaved(saved.favorites),
    wishlist: toSaved(saved.wishlist),
    visited: toSaved(saved.visited),
  }
}

export function useChat(places: RecommendedPlace[]) {
  const { t } = useTranslation()
  // Lazy init: greeting + başlangıç önerileri o anki dilde (effect'te setState yok).
  const [messages, setMessages] = useState<ChatBubble[]>(() => [
    { role: 'model', text: t('chat.greeting') },
  ])
  const [suggestions, setSuggestions] = useState<string[]>(() => [
    t('chat.suggestion1'),
    t('chat.suggestion2'),
    t('chat.suggestion3'),
  ])

  const mutation = useMutation({
    mutationFn: async ({ text, history }: { text: string; history: ChatMessage[] }) => {
      const response = await sendChat({ message: text, history, context: buildContext(places) })
      await applyActions(response.actions)
      return response
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.reply, recommendations: response.recommendations },
      ])
      setSuggestions(response.suggestions)
    },
    onError: (error) => {
      const status = (error as { status?: number }).status
      let text = t('chat.errorGeneric')
      if (status === 503) {
        text = t('chat.errorNoKey')
      } else if (status === 429) {
        text = t('chat.errorQuota')
      }
      setMessages((prev) => [...prev, { role: 'model', text }])
    },
  })

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || mutation.isPending) return
    // İlk eleman karşılama mesajı; geçmişe dahil etme.
    const history: ChatMessage[] = messages
      .slice(1)
      .map((message) => ({ role: message.role, text: message.text }))
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setSuggestions([])
    mutation.mutate({ text: trimmed, history })
  }

  return {
    messages,
    suggestions,
    send,
    isPending: mutation.isPending,
  }
}
