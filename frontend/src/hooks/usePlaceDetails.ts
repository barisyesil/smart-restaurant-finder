import { useQuery } from '@tanstack/react-query'

import { getPlaceDetails } from '@/api/places'

export function usePlaceDetails(id: string | null) {
  return useQuery({
    queryKey: ['place-detail', id],
    queryFn: () => getPlaceDetails(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
}
