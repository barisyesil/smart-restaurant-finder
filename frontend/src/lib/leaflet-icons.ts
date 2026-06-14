import L from 'leaflet'

import { getCategoryMeta } from '@/lib/constants'

const USER_COLOR = '#dc2626' // red-600

function pinSvg(color: string, width: number): string {
  const height = Math.round(width * 1.3)
  return `<svg width="${width}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.37 18.63 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="4.5" fill="#fff"/>
  </svg>`
}

export function createCategoryIcon(category: string): L.DivIcon {
  const { color } = getCategoryMeta(category)
  const width = 26
  const height = Math.round(width * 1.3)
  return L.divIcon({
    html: pinSvg(color, width),
    className: 'pin-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 4],
  })
}

const userWidth = 34
const userHeight = Math.round(userWidth * 1.3)

export const userIcon = L.divIcon({
  html: pinSvg(USER_COLOR, userWidth),
  className: 'pin-marker pin-marker--user',
  iconSize: [userWidth, userHeight],
  iconAnchor: [userWidth / 2, userHeight],
  popupAnchor: [0, -userHeight + 4],
})
