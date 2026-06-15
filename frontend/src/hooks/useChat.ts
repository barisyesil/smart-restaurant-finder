import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { sendChat, type ChatAction, type ChatContext, type ChatMessage } from '@/api/chat'
import { geocode } from '@/api/geocode'
import { useAppStore } from '@/store/useAppStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'

export interface ChatBubble {
  role: 'user' | 'model'
  text: string
}

const GREETING: ChatBubble = {
  role: 'model',
  text: 'Merhaba! Ne canın çekiyor? Örneğin "yürüme mesafesinde bütçe dostu bir kahveci" yaz, haritayı senin için ayarlayayım.',
}

const INITIAL_SUGGESTIONS = ['Yakındaki açık kafeler', 'Bütçe dostu restoran', 'Tatlıcı öner']

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

function buildContext(): ChatContext {
  const prefs = usePreferencesStore.getState()
  return {
    categories: prefs.categories,
    cuisines: prefs.cuisines,
    max_distance: prefs.maxDistance,
    max_price: prefs.maxPrice,
    open_now: prefs.openNow,
    has_location: useAppStore.getState().customLocation !== null,
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatBubble[]>([GREETING])
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS)

  const mutation = useMutation({
    mutationFn: async ({ text, history }: { text: string; history: ChatMessage[] }) => {
      const response = await sendChat({ message: text, history, context: buildContext() })
      await applyActions(response.actions)
      return response
    },
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: 'model', text: response.reply }])
      setSuggestions(response.suggestions)
    },
    onError: (error) => {
      const status = (error as { status?: number }).status
      const text =
        status === 503
          ? 'AI asistanı henüz yapılandırılmamış (sunucuda GEMINI_API_KEY eksik).'
          : 'Şu an yanıt veremedim, lütfen tekrar dener misin?'
      setMessages((prev) => [...prev, { role: 'model', text }])
    },
  })

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || mutation.isPending) return
    const history: ChatMessage[] = messages
      .filter((message) => message !== GREETING)
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
