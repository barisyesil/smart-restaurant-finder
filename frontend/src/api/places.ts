import { apiGet } from '@/api/client'
import type { Place, PlaceDetail } from '@/types/place'

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
