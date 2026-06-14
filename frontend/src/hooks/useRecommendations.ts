import { useQuery } from '@tanstack/react-query'

import { getRecommendations } from '@/api/places'
import type { Coordinates } from '@/hooks/useGeolocation'
import type { Preferences } from '@/store/usePreferencesStore'

export function useRecommendations(
  coords: Coordinates | null,
  prefs: Preferences,
  favoriteIds: string[],
  favoriteTypes: string[],
) {
  return useQuery({
    queryKey: [
      'recommend',
      coords?.lat,
      coords?.lon,
      prefs.maxDistance,
      prefs.categories,
      prefs.cuisines,
      prefs.maxPrice,
      prefs.openNow,
      favoriteIds,
      favoriteTypes,
    ],
    queryFn: () =>
      getRecommendations({
        lat: coords!.lat,
        lon: coords!.lon,
        radius: prefs.maxDistance,
        categories: prefs.categories,
        cuisines: prefs.cuisines,
        max_price: prefs.maxPrice,
        open_now: prefs.openNow,
        favorite_ids: favoriteIds,
        favorite_types: favoriteTypes,
      }),
    enabled: coords !== null,
    staleTime: 1000 * 60 * 5,
  })
}
