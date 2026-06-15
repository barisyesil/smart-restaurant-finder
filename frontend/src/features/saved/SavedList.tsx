import { PlaceCard } from '@/features/places/PlaceCard'
import type { Coordinates } from '@/hooks/useGeolocation'
import { haversineDistance } from '@/lib/geo'
import { useAppStore } from '@/store/useAppStore'
import { useSavedPlacesStore, type SavedPlace } from '@/store/useSavedPlacesStore'
import type { Place } from '@/types/place'

interface SavedListProps {
  kind: 'favorites' | 'wishlist' | 'visited'
  coords: Coordinates | null
}

const META: Record<SavedListProps['kind'], { title: string; empty: string }> = {
  favorites: {
    title: 'Favorilerim',
    empty: 'Henüz favori eklemedin. Bir mekanın detayında ❤️ ile ekleyebilirsin.',
  },
  wishlist: {
    title: 'Gitmek İstediklerim',
    empty: 'Henüz listene yer eklemedin. Mekan detayından 🔖 ile ekleyebilirsin.',
  },
  visited: {
    title: 'Gittiğim Yerler',
    empty: 'Henüz gittiğin yer işaretlemedin. Mekan detayından "Gittim" diyebilirsin.',
  },
}

function toPlace(saved: SavedPlace, coords: Coordinates | null): Place {
  return {
    ...saved,
    address: null,
    open_now: null,
    photo_name: null,
    distance_m: coords
      ? Math.round(haversineDistance(coords.lat, coords.lon, saved.lat, saved.lon))
      : 0,
  }
}

export function SavedList({ kind, coords }: SavedListProps) {
  const items = useSavedPlacesStore((state) => state[kind])
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const selectPlace = useAppStore((state) => state.selectPlace)

  const { title, empty } = META[kind]

  if (items.length === 0) {
    return <div className="p-8 text-center text-sm text-muted-foreground">{empty}</div>
  }

  const places = items
    .map((item) => toPlace(item, coords))
    .sort((a, b) => a.distance_m - b.distance_m)

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{items.length} mekan</p>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            selected={place.id === selectedPlaceId}
            onSelect={selectPlace}
          />
        ))}
      </div>
    </div>
  )
}
