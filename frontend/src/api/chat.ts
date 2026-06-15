import { apiPost } from '@/api/client'

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface ChatContext {
  categories: string[]
  cuisines: string[]
  max_distance: number | null
  max_price: number | null
  open_now: boolean | null
  has_location: boolean
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
