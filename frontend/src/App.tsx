import { AccountButton } from '@/components/AccountButton'
import { BottomSheet } from '@/components/BottomSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthDialog } from '@/features/auth/AuthDialog'
import { Sidebar } from '@/features/layout/Sidebar'
import { MapView } from '@/features/map/MapView'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useAppStore } from '@/store/useAppStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore'

function App() {
  const isMobile = useIsMobile()
  const { coords, error: geoError, loading: geoLoading } = useGeolocation()
  const selectPlace = useAppStore((state) => state.selectPlace)
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const customLocation = useAppStore((state) => state.customLocation)

  const categories = usePreferencesStore((state) => state.categories)
  const cuisines = usePreferencesStore((state) => state.cuisines)
  const maxDistance = usePreferencesStore((state) => state.maxDistance)
  const maxPrice = usePreferencesStore((state) => state.maxPrice)
  const openNow = usePreferencesStore((state) => state.openNow)
  const favorites = useSavedPlacesStore((state) => state.favorites)

  const favoriteIds = favorites.map((favorite) => favorite.id)
  const favoriteTypes = [...new Set(favorites.flatMap((favorite) => favorite.types))]

  // Aktif konum: kullanıcı bir konum aradıysa o, yoksa gerçek (geolocation) konum.
  const activeCoords = customLocation ?? coords
  const prefs = { categories, cuisines, maxDistance, maxPrice, openNow }
  const { data: recommended = [], isLoading, isError } = useRecommendations(
    activeCoords,
    prefs,
    favoriteIds,
    favoriteTypes,
  )

  // "Açık" tercihi seçiliyse yalnızca KESİN kapalı olanları gizle.
  // (Çalışma saati bilinmeyen mekanlar — open_now === null — listede kalır.)
  const places = openNow ? recommended.filter((place) => place.open_now !== false) : recommended

  const panel = (
    <Sidebar
      places={places}
      isLoading={isLoading}
      isError={isError}
      geoLoading={geoLoading}
      geoError={geoError}
      coords={activeCoords}
    />
  )

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {!isMobile && (
        <aside className="h-full w-[380px] shrink-0 overflow-y-auto border-r bg-background">
          {panel}
        </aside>
      )}

      <div className="relative flex-1">
        {activeCoords ? (
          <MapView
            center={activeCoords}
            userCoords={coords}
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={selectPlace}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted p-6 text-center text-muted-foreground">
            {geoError ?? 'Harita için konum bekleniyor…'}
          </div>
        )}

        <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
          <AccountButton />
          <ThemeToggle />
        </div>
      </div>

      {isMobile && <BottomSheet expandKey={selectedPlaceId}>{panel}</BottomSheet>}

      <AuthDialog />
    </div>
  )
}

export default App
