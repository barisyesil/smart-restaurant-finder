import { create } from 'zustand'

interface AppState {
  radius: number
  selectedPlaceId: number | null
  setRadius: (radius: number) => void
  selectPlace: (id: number | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  radius: 1000,
  selectedPlaceId: null,
  setRadius: (radius) => set({ radius }),
  selectPlace: (selectedPlaceId) => set({ selectedPlaceId }),
}))
