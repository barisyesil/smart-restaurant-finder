import coffeeRaw from 'lucide-static/icons/coffee.svg?raw'
import mapPinRaw from 'lucide-static/icons/map-pin.svg?raw'
import sandwichRaw from 'lucide-static/icons/sandwich.svg?raw'
import utensilsRaw from 'lucide-static/icons/utensils-crossed.svg?raw'

// Lucide SVG'sinin dış <svg> sarmalını atıp yalnızca iç path'leri alır.
function innerSvg(raw: string): string {
  return raw
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim()
}

const GLYPHS: Record<string, string> = {
  restaurant: innerSvg(utensilsRaw),
  cafe: innerSvg(coffeeRaw),
  fast_food: innerSvg(sandwichRaw),
}
const DEFAULT_GLYPH = innerSvg(mapPinRaw)

export const MARKER_WIDTH = 40
export const MARKER_HEIGHT = 52
export const MARKER_ANCHOR_X = 20
export const MARKER_ANCHOR_Y = 49

const PIN_PATH = 'M20 1C10.6 1 3 8.6 3 18c0 12 17 30 17 30s17-18 17-30C37 8.6 29.4 1 20 1z'

function toDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

/** Kategori glyph'i içeren, gölgeli, premium pin (data URI). */
export function categoryMarkerUrl(category: string, color: string): string {
  const glyph = GLYPHS[category] ?? DEFAULT_GLYPH
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${MARKER_WIDTH}' height='${MARKER_HEIGHT}' viewBox='0 0 ${MARKER_WIDTH} ${MARKER_HEIGHT}'>
    <ellipse cx='20' cy='49' rx='6' ry='2.4' fill='rgba(0,0,0,0.18)'/>
    <path d='${PIN_PATH}' fill='${color}' stroke='#ffffff' stroke-width='2'/>
    <circle cx='20' cy='18' r='11' fill='#ffffff'/>
    <g transform='translate(12 10) scale(0.66)' fill='none' stroke='${color}' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'>${glyph}</g>
  </svg>`
  return toDataUri(svg)
}

/** Kullanıcının konumu için kırmızı pin işaretçisi (data URI). */
export const userMarkerUrl = toDataUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${MARKER_WIDTH}' height='${MARKER_HEIGHT}' viewBox='0 0 ${MARKER_WIDTH} ${MARKER_HEIGHT}'>
    <ellipse cx='20' cy='49' rx='6' ry='2.4' fill='rgba(0,0,0,0.22)'/>
    <path d='${PIN_PATH}' fill='#dc2626' stroke='#ffffff' stroke-width='2'/>
    <circle cx='20' cy='18' r='6' fill='#ffffff'/>
  </svg>`,
)
