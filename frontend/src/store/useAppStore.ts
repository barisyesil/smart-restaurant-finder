import { create } from 'zustand'

interface AppState {
  radius: number
  selectedPlaceId: string | null
  setRadius: (radius: number) => void
  selectPlace: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  radius: 1000,
  selectedPlaceId: null,
  setRadius: (radius) => set({ radius }),
  selectPlace: (selectedPlaceId) => set({ selectedPlaceId }),
}))
