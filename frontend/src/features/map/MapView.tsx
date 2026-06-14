import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'

import type { Coordinates } from '@/hooks/useGeolocation'
import { formatDistance, getCategoryMeta } from '@/lib/constants'
import { createCategoryIcon, userIcon } from '@/lib/leaflet-icons'
import type { Place } from '@/types/place'

interface MapViewProps {
  center: Coordinates
  places: Place[]
  onSelectPlace: (id: number) => void
}

export function MapView({ center, places, onSelectPlace }: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={15}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />

      <Marker position={[center.lat, center.lon]} icon={userIcon}>
        <Popup>Buradasınız</Popup>
      </Marker>

      {places.map((place) => {
        const { label } = getCategoryMeta(place.category)
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={createCategoryIcon(place.category)}
            eventHandlers={{ click: () => onSelectPlace(place.id) }}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {label}
              {place.cuisine ? ` · ${place.cuisine}` : ''}
              <br />
              {formatDistance(place.distance_m)}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
