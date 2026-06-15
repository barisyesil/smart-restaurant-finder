import { apiPost } from '@/api/client'

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface ChatPlace {
  id: string
  name: string
  category: string
  rating: number | null
  distance_m: number | null
  price_level: number | null
  open_now: boolean | null
  reason: string | null
}

export interface ChatSavedPlace {
  id: string
  name: string
  category: string
}

export interface ChatContext {
  locale: string
  categories: string[]
  cuisines: string[]
  max_distance: number | null
  max_price: number | null
  open_now: boolean | null
  has_location: boolean
  places: ChatPlace[]
  favorites: ChatSavedPlace[]
  wishlist: ChatSavedPlace[]
  visited: ChatSavedPlace[]
}

export interface PlaceRecommendation {
  place_id: string
  reason: string
}

export interface ChatAction {
  type: 'apply_filters' | 'set_location' | 'reset_filters'
  categories?: string[] | null
  cuisines?: string[] | null
  max_distance?: number | null
  max_price?: number | null
  open_now?: boolean | null
  location_query?: string | null
}

export interface ChatResponse {
  reply: string
  actions: ChatAction[]
  recommendations: PlaceRecommendation[]
  suggestions: string[]
}

export interface ChatRequestBody {
  message: string
  history: ChatMessage[]
  context: ChatContext
}

export function sendChat(body: ChatRequestBody): Promise<ChatResponse> {
  return apiPost<ChatResponse>('/chat', body)
}
