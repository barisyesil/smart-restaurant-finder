import { BottomSheet } from '@/components/BottomSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MapView } from '@/features/map/MapView'
import { PlacesPanel } from '@/features/places/PlacesPanel'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const isMobile = useIsMobile()
  const { coords, error: geoError, loading: geoLoading } = useGeolocation()
  const radius = useAppStore((state) => state.radius)
  const selectPlace = useAppStore((state) => state.selectPlace)
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const customLocation = useAppStore((state) => state.customLocation)

  // Aktif konum: kullanıcı bir konum aradıysa o, yoksa gerçek (geolocation) konum.
  const activeCoords = customLocation ?? coords
  const { data: places = [], isLoading, isError } = useNearbyPlaces(activeCoords, radius)

  const panel = (
    <PlacesPanel
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
      {/* Masaüstü: sabit yapısal sidebar */}
      {!isMobile && (
        <aside className="h-full w-[380px] shrink-0 overflow-y-auto border-r bg-background">
          {panel}
        </aside>
      )}

      {/* Harita alanı (kalan tüm genişlik) */}
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

        <div className="absolute right-3 top-3 z-50">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobil: alttan açılan bottom sheet */}
      {isMobile && <BottomSheet expandKey={selectedPlaceId}>{panel}</BottomSheet>}
    </div>
  )
}

export default App
