import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoritePlace {
  id: string
  name: string
  category: string
  types: string[]
}

interface FavoritesState {
  favorites: FavoritePlace[]
  toggle: (place: FavoritePlace) => void
}

// Misafir kullanıcılar için LocalStorage'da kalıcı favoriler.
// Türleri de saklarız → içerik-tabanlı öneri (favori benzerliği) için.
// Gün 4'te giriş yapan kullanıcılar için backend ile senkronize edilecek.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      toggle: (place) =>
        set((state) => ({
          favorites: state.favorites.some((item) => item.id === place.id)
            ? state.favorites.filter((item) => item.id !== place.id)
            : [...state.favorites, place],
        })),
    }),
    { name: 'favorites-v2' },
  ),
)
