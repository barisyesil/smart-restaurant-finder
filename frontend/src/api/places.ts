import { apiGet, apiPost } from '@/api/client'
import type { Place, PlaceDetail, RecommendedPlace } from '@/types/place'

export interface NearbyParams {
  lat: number
  lon: number
  radius: number
}

export function getNearbyPlaces({ lat, lon, radius }: NearbyParams): Promise<Place[]> {
  return apiGet<Place[]>('/places/nearby', { lat, lon, radius })
}

export function getPlaceDetails(id: string): Promise<PlaceDetail> {
  return apiGet<PlaceDetail>(`/places/${encodeURIComponent(id)}`)
}

export interface RecommendParams {
  lat: number
  lon: number
  radius: number
  categories: string[]
  cuisines: string[]
  max_price: number | null
  open_now: boolean
  favorite_ids: string[]
  favorite_types: string[]
}

export function getRecommendations(params: RecommendParams): Promise<RecommendedPlace[]> {
  return apiPost<RecommendedPlace[]>('/places/recommend', params)
}
