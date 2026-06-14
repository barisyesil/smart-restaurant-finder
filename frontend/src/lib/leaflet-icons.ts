import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import { getCategoryMeta } from '@/lib/constants'

// Vite ile Leaflet'in varsayılan ikon yollarının bozulması sorununu giderir.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export function createCategoryIcon(category: string): L.DivIcon {
  const meta = getCategoryMeta(category)
  return L.divIcon({
    html: `<div class="place-marker">${meta.emoji}</div>`,
    className: 'place-marker-wrapper',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

export const userIcon = L.divIcon({
  html: '<div class="user-marker"></div>',
  className: 'user-marker-wrapper',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})
