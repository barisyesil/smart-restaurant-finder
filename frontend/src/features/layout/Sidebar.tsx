import { SidebarNav } from '@/components/SidebarNav'
import { DiscoverPanel } from '@/features/places/DiscoverPanel'
import { PlaceDetail } from '@/features/places/PlaceDetail'
import { ProfilePanel } from '@/features/profile/ProfilePanel'
import { SavedList } from '@/features/saved/SavedList'
import type { Coordinates } from '@/hooks/useGeolocation'
import { useAppStore } from '@/store/useAppStore'
import type { RecommendedPlace } from '@/types/place'

interface SidebarProps {
  places: RecommendedPlace[]
  isLoading: boolean
  isError: boolean
  geoLoading: boolean
  geoError: string | null
  coords: Coordinates | null
}

/** Aktif görünümün içeriği (navigasyon ÇUBUĞU olmadan). Hem masaüstü kenar çubuğunda
 *  hem mobil içerik panelinde kullanılır. */
export function SidebarContent(props: SidebarProps) {
  const view = useAppStore((state) => state.view)
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const selectPlace = useAppStore((state) => state.selectPlace)

  if (selectedPlaceId) {
    const summary = props.places.find((place) => place.id === selectedPlaceId)
    return (
      <PlaceDetail placeId={selectedPlaceId} summary={summary} onClose={() => selectPlace(null)} />
    )
  }

  return (
    <>
      {view === 'discover' && <DiscoverPanel {...props} />}
      {view === 'favorites' && <SavedList kind="favorites" coords={props.coords} />}
      {view === 'wishlist' && <SavedList kind="wishlist" coords={props.coords} />}
      {view === 'visited' && <SavedList kind="visited" coords={props.coords} />}
      {view === 'profile' && <ProfilePanel />}
    </>
  )
}

/** Masaüstü kenar çubuğu: üstte navigasyon + altında içerik. */
export function Sidebar(props: SidebarProps) {
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)

  return (
    <>
      {!selectedPlaceId && <SidebarNav className="border-b" />}
      <SidebarContent {...props} />
    </>
  )
}
