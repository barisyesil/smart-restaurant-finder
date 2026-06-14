import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  ids: string[]
  toggle: (id: string) => void
}

// Misafir kullanıcılar için LocalStorage'da kalıcı favoriler.
// Gün 4'te giriş yapan kullanıcılar için backend ile senkronize edilecek.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((existing) => existing !== id)
            : [...state.ids, id],
        })),
    }),
    { name: 'favorites' },
  ),
)
