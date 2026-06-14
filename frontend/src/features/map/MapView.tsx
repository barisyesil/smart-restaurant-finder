import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'

import type { Coordinates } from '@/hooks/useGeolocation'
import { getCategoryMeta } from '@/lib/constants'
import type { Place } from '@/types/place'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

// Ekran kirliliğini azaltmak için diğer POI'leri, toplu taşımayı ve yol etiket
// ikonlarını gizleyen sade harita stili. (styles yalnızca mapId YOKKEN çalışır.)
const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

const CIRCLE_PATH = 'M 0 0 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0'

function categoryMarkerIcon(color: string, selected: boolean) {
  return {
    path: CIRCLE_PATH,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
    scale: selected ? 1.7 : 1.1,
  }
}

const USER_MARKER_ICON = {
  path: CIRCLE_PATH,
  fillColor: '#dc2626',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  scale: 1.5,
}

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
        styles={MAP_STYLE}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        className="h-full w-full"
      >
        <MapController center={center} />

        {userCoords && (
          <Marker
            position={{ lat: userCoords.lat, lng: userCoords.lon }}
            icon={USER_MARKER_ICON}
            title="Buradasınız"
            zIndex={20}
          />
        )}

        {places.map((place) => {
          const { color } = getCategoryMeta(place.category)
          const selected = place.id === selectedPlaceId
          return (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lon }}
              icon={categoryMarkerIcon(color, selected)}
              title={place.name}
              zIndex={selected ? 10 : 1}
              onClick={() => onSelectPlace(place.id)}
            />
          )
        })}
      </Map>
    </APIProvider>
  )
}
