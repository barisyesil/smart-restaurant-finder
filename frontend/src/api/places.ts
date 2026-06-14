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
  max_price: number | null
  favorite_ids: string[]
}

export function getRecommendations(params: RecommendParams): Promise<RecommendedPlace[]> {
  return apiPost<RecommendedPlace[]>('/places/recommend', params)
}
