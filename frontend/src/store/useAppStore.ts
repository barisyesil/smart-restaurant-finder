import { create } from 'zustand'

import type { Coordinates } from '@/hooks/useGeolocation'

export type SidebarView = 'discover' | 'favorites' | 'wishlist' | 'visited' | 'profile'

// Mobil bottom-sheet snap noktaları. Peek = özet (alt navigasyon görünür).
export const SHEET_PEEK = '110px'
export type SheetSnap = number | string

interface AppState {
  selectedPlaceId: string | null
  customLocation: Coordinates | null // kullanıcının aradığı/seçtiği konum (yoksa geolocation kullanılır)
  view: SidebarView
  authDialogOpen: boolean
  chatOpen: boolean // AI asistan paneli açık mı (mobilde sheet ile çakışmayı önlemek için global)
  sheetSnap: SheetSnap // mobil bottom-sheet'in aktif snap noktası
  selectPlace: (id: string | null) => void
  setCustomLocation: (location: Coordinates | null) => void
  setView: (view: SidebarView) => void
  setAuthDialogOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
  setSheetSnap: (snap: SheetSnap) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlaceId: null,
  customLocation: null,
  view: 'discover',
  authDialogOpen: false,
  chatOpen: false,
  sheetSnap: SHEET_PEEK,
  // Mekan seçilince (kart/marker) sheet'i tam aç ki detay görünsün.
  selectPlace: (selectedPlaceId) =>
    set(selectedPlaceId ? { selectedPlaceId, sheetSnap: 1 } : { selectedPlaceId }),
  setCustomLocation: (customLocation) => set({ customLocation }),
  // Nav sekmesine basınca (mobil) sheet'i tam aç ki içerik görünsün.
  setView: (view) => set({ view, sheetSnap: 1 }),
  setAuthDialogOpen: (authDialogOpen) => set({ authDialogOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setSheetSnap: (sheetSnap) => set({ sheetSnap }),
}))
