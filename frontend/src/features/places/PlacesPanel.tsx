import { Sparkles, UtensilsCrossed } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LocationSearch } from '@/features/location/LocationSearch'
import { PlaceDetail } from '@/features/places/PlaceDetail'
import { PlaceList } from '@/features/places/PlaceList'
import { QuickFilters } from '@/features/preferences/QuickFilters'
import type { Coordinates } from '@/hooks/useGeolocation'
import { useAppStore } from '@/store/useAppStore'
import type { RecommendedPlace } from '@/types/place'

interface PlacesPanelProps {
  places: RecommendedPlace[]
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

  function surpriseMe() {
    if (places.length === 0) return
    const pool = places.slice(0, Math.min(8, places.length))
    const pick = pool[Math.floor(Math.random() * pool.length)]
    selectPlace(pick.id)
  }

  const subtitle = coords
    ? `Senin için en uygun ${places.length} mekan`
    : geoLoading
      ? 'Konumunuz alınıyor…'
      : 'Konum bekleniyor'

  return (
    <div>
      <div className="sticky top-0 z-10 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <h1 className="text-base font-semibold tracking-tight">Akıllı Restoran Öneri</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <LocationSearch />
        <QuickFilters />

        <Button
          onClick={surpriseMe}
          disabled={places.length === 0}
          className="w-full gap-2"
          variant="secondary"
        >
          <Sparkles className="h-4 w-4" />
          Sürpriz beni
        </Button>
      </div>

      {!coords && geoError ? (
        <p className="p-4 text-sm text-destructive">
          {geoError} Yukarıdan bir konum arayabilirsiniz.
        </p>
      ) : (
        <PlaceList places={places} isLoading={isLoading || geoLoading} isError={isError} />
      )}
    </div>
  )
}
