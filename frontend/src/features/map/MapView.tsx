import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet'

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
import { useTheme } from '@/providers/theme-context'
import type { Place } from '@/types/place'

// Sade, etiket-yoğun olmayan tile'lar (POI gürültüsü düşük). Açık kaynak: OSM + CARTO.
const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function buildIcon(url: string, scale: number): L.Icon {
  return L.icon({
    iconUrl: url,
    iconSize: [MARKER_WIDTH * scale, MARKER_HEIGHT * scale],
    iconAnchor: [MARKER_ANCHOR_X * scale, MARKER_ANCHOR_Y * scale],
  })
}

const USER_ICON = buildIcon(userMarkerUrl, 1.15)

/** Aktif konum değiştiğinde haritayı oraya kaydırır (kullanıcı serbestçe gezebilir). */
function Recenter({ center }: { center: Coordinates }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lon], map.getZoom())
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
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={15}
      zoomControl={false}
      className="h-full w-full bg-muted"
    >
      <TileLayer key={isDark ? 'dark' : 'light'} url={isDark ? DARK_TILES : LIGHT_TILES} attribution={ATTRIBUTION} />
      <ZoomControl position="bottomleft" />
      <Recenter center={center} />

      {userCoords && (
        <Marker position={[userCoords.lat, userCoords.lon]} icon={USER_ICON} zIndexOffset={1000} />
      )}

      {places.map((place) => {
        const { color } = getCategoryMeta(place.category)
        const selected = place.id === selectedPlaceId
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={buildIcon(categoryMarkerUrl(place.category, color), selected ? 1.25 : 1)}
            zIndexOffset={selected ? 500 : 0}
            eventHandlers={{ click: () => onSelectPlace(place.id) }}
          />
        )
      })}
    </MapContainer>
  )
}
