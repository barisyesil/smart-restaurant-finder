import { PlaceCard } from '@/features/places/PlaceCard'
import { useAppStore } from '@/store/useAppStore'
import type { RecommendedPlace } from '@/types/place'

interface PlaceListProps {
  places: RecommendedPlace[]
  isLoading: boolean
  isError: boolean
}

export function PlaceList({ places, isLoading, isError }: PlaceListProps) {
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const selectPlace = useAppStore((state) => state.selectPlace)

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Mekanlar yükleniyor…</p>
  }
  if (isError) {
    return <p className="p-4 text-sm text-destructive">Mekanlar yüklenemedi.</p>
  }
  if (places.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Uygun mekan bulunamadı.</p>
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
