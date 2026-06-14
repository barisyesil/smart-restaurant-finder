import { useQuery } from '@tanstack/react-query'

import { getNearbyPlaces } from '@/api/places'
import type { Coordinates } from '@/hooks/useGeolocation'

export function useNearbyPlaces(coords: Coordinates | null, radius: number) {
  return useQuery({
    queryKey: ['places', coords?.lat, coords?.lon, radius],
    queryFn: () => getNearbyPlaces({ lat: coords!.lat, lon: coords!.lon, radius }),
    enabled: coords !== null,
    staleTime: 1000 * 60 * 5, // 5 dakika boyunca tekrar istek atma
  })
}
