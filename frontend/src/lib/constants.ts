import { Coffee, MapPin, Sandwich, UtensilsCrossed, type LucideIcon } from 'lucide-react'

export interface CategoryMeta {
  color: string
  Icon: LucideIcon
}

// Etiketler i18n'de (categories.*) tutulur; burada yalnızca renk + ikon.
export const CATEGORY_META: Record<string, CategoryMeta> = {
  restaurant: { color: '#ea580c', Icon: UtensilsCrossed },
  cafe: { color: '#9333ea', Icon: Coffee },
  fast_food: { color: '#16a34a', Icon: Sandwich },
}

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  color: '#475569',
  Icon: MapPin,
}

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** Ortalama yürüme hızı ~5 km/s baz alınarak tahmini yürüme süresi (dakika).
 *  Birim eki çağırandan gelir (i18n: units.min). */
export function formatWalkingTime(meters: number, minLabel = 'dk'): string {
  const minutes = Math.max(1, Math.round(meters / 80))
  return `${minutes} ${minLabel}`
}

/** Google price_level (0-4) → ₺ sembolleri. Veri yoksa null.
 *  "Ücretsiz" etiketi çağırandan gelir (i18n: price.free). */
export function formatPriceLevel(level: number | null, freeLabel = 'Ücretsiz'): string | null {
  if (level === null || level === undefined) return null
  if (level === 0) return freeLabel
  return '₺'.repeat(level)
}
