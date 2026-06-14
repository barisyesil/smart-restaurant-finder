import { MapView } from '@/features/map/MapView'
import { PlaceList } from '@/features/places/PlaceList'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation()
  const radius = useAppStore((state) => state.radius)
  const { data: places = [], isLoading, isError } = useNearbyPlaces(coords, radius)

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <span className="text-xl">🍽️</span>
        <h1 className="text-lg font-semibold">Akıllı Restoran Öneri</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-sm overflow-y-auto border-r">
          {geoLoading && <p className="p-4 text-sm text-muted-foreground">Konumunuz alınıyor…</p>}
          {geoError && <p className="p-4 text-sm text-destructive">{geoError}</p>}
          {coords && <PlaceList places={places} isLoading={isLoading} isError={isError} />}
        </aside>

        <section className="flex-1">
          {coords ? (
            <MapView center={coords} places={places} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Harita için konum bekleniyor…
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
