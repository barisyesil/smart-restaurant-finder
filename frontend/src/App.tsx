import { UtensilsCrossed } from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'
import { MapView } from '@/features/map/MapView'
import { PlaceList } from '@/features/places/PlaceList'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation()
  const radius = useAppStore((state) => state.radius)
  const selectPlace = useAppStore((state) => state.selectPlace)
  const { data: places = [], isLoading, isError } = useNearbyPlaces(coords, radius)

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Harita arka plan olarak tüm ekranı kaplar */}
      <div className="absolute inset-0">
        {coords ? (
          <MapView center={coords} places={places} onSelectPlace={selectPlace} />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
            {geoError ?? 'Harita için konum bekleniyor…'}
          </div>
        )}
      </div>

      {/* Yüzen üst çubuk */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-center gap-2 p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 shadow-lg ring-1 ring-border backdrop-blur">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <span className="font-semibold">Akıllı Restoran Öneri</span>
        </div>
        <div className="pointer-events-auto ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Yüzen sonuç paneli: mobilde alt-sheet, masaüstünde sol panel */}
      <aside
        className="absolute z-[1000] flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-xl ring-1 ring-border backdrop-blur
          inset-x-3 bottom-3 max-h-[45vh]
          md:inset-x-auto md:bottom-auto md:left-3 md:top-20 md:max-h-[calc(100vh-6rem)] md:w-[370px]"
      >
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Yakındaki Mekanlar</h2>
          <p className="text-xs text-muted-foreground">
            {coords ? `${places.length} mekan bulundu` : 'Konum bekleniyor'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {geoLoading && <p className="p-4 text-sm text-muted-foreground">Konumunuz alınıyor…</p>}
          {geoError && <p className="p-4 text-sm text-destructive">{geoError}</p>}
          {coords && <PlaceList places={places} isLoading={isLoading} isError={isError} />}
        </div>
      </aside>
    </div>
  )
}

export default App
