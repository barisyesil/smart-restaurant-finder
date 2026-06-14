import { AdvancedMarker, APIProvider, Map, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'

import type { Coordinates } from '@/hooks/useGeolocation'
import { getCategoryMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Place } from '@/types/place'

/** Aktif konum değiştiğinde haritayı oraya kaydırır (kullanıcı serbestçe gezebilir). */
function MapController({ center }: { center: Coordinates }) {
  const map = useMap()
  const prevKey = useRef('')

  useEffect(() => {
    if (!map) return
    const key = `${center.lat},${center.lon}`
    if (key !== prevKey.current) {
      prevKey.current = key
      map.panTo({ lat: center.lat, lng: center.lon })
    }
  }, [map, center])

  return null
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const MAP_ID = 'DEMO_MAP_ID' // AdvancedMarker için gerekli; production'da gerçek Map ID kullanılır

interface MapViewProps {
  center: Coordinates
  userCoords: Coordinates | null
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}

export function MapView({
  center,
  userCoords,
  places,
  selectedPlaceId,
  onSelectPlace,
}: MapViewProps) {
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
        <MapController center={center} />

        {userCoords && (
          <AdvancedMarker
            position={{ lat: userCoords.lat, lng: userCoords.lon }}
            title="Buradasınız"
          >
            <div className="user-pin" />
          </AdvancedMarker>
        )}

        {places.map((place) => {
          const { color, Icon } = getCategoryMeta(place.category)
          const selected = place.id === selectedPlaceId
          return (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lon }}
              title={place.name}
              zIndex={selected ? 10 : 1}
              onClick={() => onSelectPlace(place.id)}
            >
              <div
                className={cn('place-pin', selected && 'place-pin--selected')}
                style={
                  selected
                    ? { backgroundColor: color, color: '#ffffff', borderColor: color }
                    : { color }
                }
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
            </AdvancedMarker>
          )
        })}
      </Map>
    </APIProvider>
  )
}
