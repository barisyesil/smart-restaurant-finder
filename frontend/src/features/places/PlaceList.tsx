import { useTranslation } from 'react-i18next'

import { PlaceCard } from '@/features/places/PlaceCard'
import { useAppStore } from '@/store/useAppStore'
import type { RecommendedPlace } from '@/types/place'

interface PlaceListProps {
  places: RecommendedPlace[]
  isLoading: boolean
  isError: boolean
}

export function PlaceList({ places, isLoading, isError }: PlaceListProps) {
  const { t } = useTranslation()
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const selectPlace = useAppStore((state) => state.selectPlace)

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">{t('place.loading')}</p>
  }
  if (isError) {
    return <p className="p-4 text-sm text-destructive">{t('place.loadError')}</p>
  }
  if (places.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">{t('place.empty')}</p>
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          selected={place.id === selectedPlaceId}
          onSelect={selectPlace}
          score={place.score}
          reasons={place.reasons}
        />
      ))}
    </div>
  )
}
