import { UtensilsCrossed } from 'lucide-react'

import { PlaceDetail } from '@/features/places/PlaceDetail'
import { PlaceList } from '@/features/places/PlaceList'
import type { Coordinates } from '@/hooks/useGeolocation'
import { useAppStore } from '@/store/useAppStore'
import type { Place } from '@/types/place'

interface PlacesPanelProps {
  places: Place[]
  isLoading: boolean
  isError: boolean
  geoLoading: boolean
  geoError: string | null
  coords: Coordinates | null
}

export function PlacesPanel({
  places,
  isLoading,
  isError,
  geoLoading,
  geoError,
  coords,
}: PlacesPanelProps) {
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const selectPlace = useAppStore((state) => state.selectPlace)
  const selectedPlace = places.find((place) => place.id === selectedPlaceId)

  if (selectedPlaceId) {
    return (
      <PlaceDetail
        placeId={selectedPlaceId}
        summary={selectedPlace}
        onClose={() => selectPlace(null)}
      />
    )
  }

  const subtitle = coords
    ? `${places.length} mekan bulundu`
    : geoLoading
      ? 'Konumunuz alınıyor…'
      : 'Konum bekleniyor'

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pb-3 pt-1 md:pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <h1 className="text-base font-semibold tracking-tight">Akıllı Restoran Öneri</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {geoError ? (
          <p className="p-4 text-sm text-destructive">{geoError}</p>
        ) : (
          <PlaceList places={places} isLoading={isLoading || geoLoading} isError={isError} />
        )}
      </div>
    </div>
  )
}
