import { create } from 'zustand'

import type { Coordinates } from '@/hooks/useGeolocation'

export type SidebarView = 'discover' | 'favorites' | 'wishlist' | 'visited' | 'profile'

interface AppState {
  selectedPlaceId: string | null
  customLocation: Coordinates | null // kullanıcının aradığı/seçtiği konum (yoksa geolocation kullanılır)
  view: SidebarView
  authDialogOpen: boolean
  chatOpen: boolean // AI asistan paneli açık mı (mobilde sheet ile çakışmayı önlemek için global)
  sheetOpen: boolean // mobil içerik paneli açık mı (kapalı = sadece harita + alt tab bar)
  selectPlace: (id: string | null) => void
  setCustomLocation: (location: Coordinates | null) => void
  setView: (view: SidebarView) => void
  setAuthDialogOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
  setSheetOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlaceId: null,
  customLocation: null,
  view: 'discover',
  authDialogOpen: false,
  chatOpen: false,
  sheetOpen: false,
  // Mekan seçilince (kart/marker) içerik panelini aç ki detay görünsün.
  selectPlace: (selectedPlaceId) =>
    set(selectedPlaceId ? { selectedPlaceId, sheetOpen: true } : { selectedPlaceId }),
  setCustomLocation: (customLocation) => set({ customLocation }),
  // Nav sekmesine basınca: görünümü değiştir, açık mekan detayını kapat, paneli aç.
  setView: (view) => set({ view, sheetOpen: true, selectedPlaceId: null }),
  setAuthDialogOpen: (authDialogOpen) => set({ authDialogOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
}))
