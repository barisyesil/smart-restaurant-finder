import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Preferences {
  categories: string[] // geniş tür (restaurant/cafe/fast_food), boş = hepsi
  cuisines: string[] // özel mutfak türleri (turkish_restaurant, coffee_shop, ...)
  maxDistance: number // metre (hem arama yarıçapı hem skorlama)
  maxPrice: number | null // 0-4, null = farketmez
  openNow: boolean
}

interface PreferencesState extends Preferences {
  toggleCategory: (category: string) => void
  toggleCuisine: (cuisine: string) => void
  setMaxDistance: (meters: number) => void
  setMaxPrice: (price: number | null) => void
  setOpenNow: (value: boolean) => void
  reset: () => void
}

const DEFAULTS: Preferences = {
  categories: [],
  cuisines: [],
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
      toggleCuisine: (cuisine) =>
        set((state) => ({
          cuisines: state.cuisines.includes(cuisine)
            ? state.cuisines.filter((item) => item !== cuisine)
            : [...state.cuisines, cuisine],
        })),
      setMaxDistance: (maxDistance) => set({ maxDistance }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setOpenNow: (openNow) => set({ openNow }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'preferences' },
  ),
)
