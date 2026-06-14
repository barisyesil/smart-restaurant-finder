import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Preferences {
  categories: string[] // boş = tüm türler
  maxDistance: number // metre (hem arama yarıçapı hem skorlama)
  maxPrice: number | null // 0-4, null = farketmez
  openNow: boolean
}

interface PreferencesState extends Preferences {
  toggleCategory: (category: string) => void
  setMaxDistance: (meters: number) => void
  setMaxPrice: (price: number | null) => void
  setOpenNow: (value: boolean) => void
  reset: () => void
}

const DEFAULTS: Preferences = {
  categories: [],
  maxDistance: 1500,
  maxPrice: null,
  openNow: false,
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories.filter((item) => item !== category)
            : [...state.categories, category],
        })),
      setMaxDistance: (maxDistance) => set({ maxDistance }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setOpenNow: (openNow) => set({ openNow }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'preferences' },
  ),
)
