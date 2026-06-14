import { Coffee, MapPin, Sandwich, UtensilsCrossed, type LucideIcon } from 'lucide-react'

export interface CategoryMeta {
  label: string
  color: string
  Icon: LucideIcon
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  restaurant: { label: 'Restoran', color: '#ea580c', Icon: UtensilsCrossed },
  cafe: { label: 'Kafe', color: '#9333ea', Icon: Coffee },
  fast_food: { label: 'Fast Food', color: '#16a34a', Icon: Sandwich },
}

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  label: 'Mekan',
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

/** Ortalama yürüme hızı ~5 km/s baz alınarak tahmini yürüme süresi (dakika). */
export function formatWalkingTime(meters: number): string {
  const minutes = Math.max(1, Math.round(meters / 80))
  return `${minutes} dk`
}

/** Google price_level (0-4) → ₺ sembolleri. Veri yoksa null. */
export function formatPriceLevel(level: number | null): string | null {
  if (level === null || level === undefined) return null
  if (level === 0) return 'Ücretsiz'
  return '₺'.repeat(level)
}
