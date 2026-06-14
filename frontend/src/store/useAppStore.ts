import { create } from 'zustand'

import type { Coordinates } from '@/hooks/useGeolocation'

interface AppState {
  selectedPlaceId: string | null
  customLocation: Coordinates | null // kullanıcının aradığı/seçtiği konum (yoksa geolocation kullanılır)
  selectPlace: (id: string | null) => void
  setCustomLocation: (location: Coordinates | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlaceId: null,
  customLocation: null,
  selectPlace: (selectedPlaceId) => set({ selectedPlaceId }),
  setCustomLocation: (customLocation) => set({ customLocation }),
}))
