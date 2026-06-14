export interface CategoryMeta {
  emoji: string
  label: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  restaurant: { emoji: '🍽️', label: 'Restoran' },
  cafe: { emoji: '☕', label: 'Kafe' },
  fast_food: { emoji: '🍔', label: 'Fast Food' },
}

export const DEFAULT_CATEGORY_META: CategoryMeta = { emoji: '📍', label: 'Mekan' }

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}
