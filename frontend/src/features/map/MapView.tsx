import { AdvancedMarker, APIProvider, Map, Pin } from '@vis.gl/react-google-maps'

import type { Coordinates } from '@/hooks/useGeolocation'
import { getCategoryMeta } from '@/lib/constants'
import type { Place } from '@/types/place'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const MAP_ID = 'DEMO_MAP_ID' // AdvancedMarker için gerekli; production'da gerçek Map ID kullanılır

interface MapViewProps {
  center: Coordinates
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}

export function MapView({ center, places, selectedPlaceId, onSelectPlace }: MapViewProps) {
  if (!API_KEY) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
        Google Maps API anahtarı (VITE_GOOGLE_MAPS_API_KEY) ayarlanmamış.
      </div>
    )
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={{ lat: center.lat, lng: center.lon }}
        defaultZoom={15}
        mapId={MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
        clickableIcons={false}
        className="h-full w-full"
      >
        <AdvancedMarker position={{ lat: center.lat, lng: center.lon }} title="Buradasınız">
          <Pin background="#dc2626" borderColor="#991b1b" glyphColor="#ffffff" />
        </AdvancedMarker>

        {places.map((place) => {
          const { color } = getCategoryMeta(place.category)
          const selected = place.id === selectedPlaceId
          return (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lon }}
              title={place.name}
              zIndex={selected ? 10 : 1}
              onClick={() => onSelectPlace(place.id)}
            >
              <Pin
                background={color}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={selected ? 1.4 : 1}
              />
            </AdvancedMarker>
          )
        })}
      </Map>
    </APIProvider>
  )
}
