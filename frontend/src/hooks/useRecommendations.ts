import { useQuery } from '@tanstack/react-query'

import { getRecommendations } from '@/api/places'
import type { Coordinates } from '@/hooks/useGeolocation'
import type { Preferences } from '@/store/usePreferencesStore'

export function useRecommendations(
  coords: Coordinates | null,
  prefs: Preferences,
  favoriteIds: string[],
) {
  return useQuery({
    queryKey: [
      'recommend',
      coords?.lat,
      coords?.lon,
      prefs.maxDistance,
      prefs.categories,
      prefs.maxPrice,
      favoriteIds,
    ],
    queryFn: () =>
      getRecommendations({
        lat: coords!.lat,
        lon: coords!.lon,
        radius: prefs.maxDistance,
        categories: prefs.categories,
        max_price: prefs.maxPrice,
        favorite_ids: favoriteIds,
      }),
    enabled: coords !== null,
    staleTime: 1000 * 60 * 5,
  })
}
