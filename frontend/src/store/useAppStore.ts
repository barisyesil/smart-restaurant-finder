import { create } from 'zustand'

import type { Coordinates } from '@/hooks/useGeolocation'

interface AppState {
  radius: number
  selectedPlaceId: string | null
  customLocation: Coordinates | null // kullanıcının aradığı/seçtiği konum (yoksa geolocation kullanılır)
  setRadius: (radius: number) => void
  selectPlace: (id: string | null) => void
  setCustomLocation: (location: Coordinates | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  radius: 1000,
  selectedPlaceId: null,
  customLocation: null,
  setRadius: (radius) => set({ radius }),
  selectPlace: (selectedPlaceId) => set({ selectedPlaceId }),
  setCustomLocation: (customLocation) => set({ customLocation }),
}))
