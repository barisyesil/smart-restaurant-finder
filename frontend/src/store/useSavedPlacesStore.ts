import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Bir mekanın kaydedilen anlık görüntüsü (favori/gidilen listelerinde göstermek için).
export interface SavedPlace {
  id: string
  name: string
  category: string
  types: string[]
  rating: number | null
  user_ratings_total: number | null
  price_level: number | null
  lat: number
  lon: number
}

interface SavedPlacesState {
  favorites: SavedPlace[]
  visited: SavedPlace[]
  toggleFavorite: (place: SavedPlace) => void
  toggleVisited: (place: SavedPlace) => void
}

function toggle(list: SavedPlace[], place: SavedPlace): SavedPlace[] {
  return list.some((item) => item.id === place.id)
    ? list.filter((item) => item.id !== place.id)
    : [...list, place]
}

// Misafir kullanıcılar için LocalStorage'da kalıcı. Gün 4'te backend ile senkronize edilecek.
export const useSavedPlacesStore = create<SavedPlacesState>()(
  persist(
    (set) => ({
      favorites: [],
      visited: [],
      toggleFavorite: (place) => set((state) => ({ favorites: toggle(state.favorites, place) })),
      toggleVisited: (place) => set((state) => ({ visited: toggle(state.visited, place) })),
    }),
    { name: 'saved-places' },
  ),
)
