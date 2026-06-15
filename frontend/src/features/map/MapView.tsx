import {
  APIProvider,
  ControlPosition,
  Map,
  Marker,
  useApiIsLoaded,
  useMap,
} from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Coordinates } from '@/hooks/useGeolocation'
import { getCategoryMeta } from '@/lib/constants'
import {
  categoryMarkerUrl,
  MARKER_ANCHOR_X,
  MARKER_ANCHOR_Y,
  MARKER_HEIGHT,
  MARKER_WIDTH,
  userMarkerUrl,
} from '@/lib/map-markers'
import type { Place } from '@/types/place'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

// Ekran kirliliğini azaltan sade harita stili (styles yalnızca mapId YOKKEN çalışır).
const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

function markerIcon(url: string, scale: number): google.maps.Icon {
  return {
    url,
    scaledSize: new google.maps.Size(MARKER_WIDTH * scale, MARKER_HEIGHT * scale),
    anchor: new google.maps.Point(MARKER_ANCHOR_X * scale, MARKER_ANCHOR_Y * scale),
  }
}

interface MarkersProps {
  userCoords: Coordinates | null
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}

// google.maps yüklendikten sonra render edilir (ikonlar google.maps.Size/Point kullanır).
function Markers({ userCoords, places, selectedPlaceId, onSelectPlace }: MarkersProps) {
  const { t } = useTranslation()
  const loaded = useApiIsLoaded()
  if (!loaded) return null

  return (
    <>
      {userCoords && (
        <Marker
          position={{ lat: userCoords.lat, lng: userCoords.lon }}
          icon={markerIcon(userMarkerUrl, 1.15)}
          title={t('map.youAreHere')}
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
            icon={markerIcon(categoryMarkerUrl(place.category, color), selected ? 1.2 : 1)}
            title={place.name}
            zIndex={selected ? 10 : 1}
            onClick={() => onSelectPlace(place.id)}
          />
        )
      })}
    </>
  )
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
  const { t } = useTranslation()
  if (!API_KEY) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
        {t('map.noApiKey')}
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
        zoomControlOptions={{ position: ControlPosition.LEFT_BOTTOM }}
        clickableIcons={false}
        className="h-full w-full"
      >
        <MapController center={center} />
        <Markers
          userCoords={userCoords}
          places={places}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={onSelectPlace}
        />
      </Map>
    </APIProvider>
  )
}
