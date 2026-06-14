import { create } from 'zustand'

import type { Coordinates } from '@/hooks/useGeolocation'

export type SidebarView = 'discover' | 'favorites' | 'visited' | 'profile'

interface AppState {
  selectedPlaceId: string | null
  customLocation: Coordinates | null // kullanıcının aradığı/seçtiği konum (yoksa geolocation kullanılır)
  view: SidebarView
  selectPlace: (id: string | null) => void
  setCustomLocation: (location: Coordinates | null) => void
  setView: (view: SidebarView) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlaceId: null,
  customLocation: null,
  view: 'discover',
  selectPlace: (selectedPlaceId) => set({ selectedPlaceId }),
  setCustomLocation: (customLocation) => set({ customLocation }),
  setView: (view) => set({ view }),
}))
