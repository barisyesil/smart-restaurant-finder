import { apiGet } from '@/api/client'
import type { Place } from '@/types/place'

export interface NearbyParams {
  lat: number
  lon: number
  radius: number
}

export function getNearbyPlaces({ lat, lon, radius }: NearbyParams): Promise<Place[]> {
  return apiGet<Place[]>('/places/nearby', { lat, lon, radius })
}
