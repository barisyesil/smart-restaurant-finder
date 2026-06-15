import { apiDelete, apiGet, apiPost, apiPut } from '@/api/client'
import type { Preferences } from '@/store/usePreferencesStore'
import type { SavedPlace } from '@/store/useSavedPlacesStore'

export type SavedKind = 'favorite' | 'wishlist' | 'visited'

export interface SavedCollection {
  favorites: SavedPlace[]
  wishlist: SavedPlace[]
  visited: SavedPlace[]
}

export function getSaved(): Promise<SavedCollection> {
  return apiGet<SavedCollection>('/me/saved')
}

export function addSaved(kind: SavedKind, place: SavedPlace): Promise<void> {
  return apiPost<void>('/me/saved', { kind, place })
}

export function removeSaved(kind: SavedKind, placeId: string): Promise<void> {
  return apiDelete(`/me/saved/${kind}/${encodeURIComponent(placeId)}`)
}

interface PreferencesDto {
  categories: string[]
  cuisines: string[]
  max_distance: number
  max_price: number | null
  open_now: boolean
}

function toDto(prefs: Preferences): PreferencesDto {
  return {
    categories: prefs.categories,
    cuisines: prefs.cuisines,
    max_distance: prefs.maxDistance,
    max_price: prefs.maxPrice,
    open_now: prefs.openNow,
  }
}

function fromDto(dto: PreferencesDto): Preferences {
  return {
    categories: dto.categories,
    cuisines: dto.cuisines,
    maxDistance: dto.max_distance,
    maxPrice: dto.max_price,
    openNow: dto.open_now,
  }
}

export async function getPreferences(): Promise<Preferences> {
  return fromDto(await apiGet<PreferencesDto>('/me/preferences'))
}

export async function putPreferences(prefs: Preferences): Promise<void> {
  await apiPut<PreferencesDto>('/me/preferences', toDto(prefs))
}
