import { useTranslation } from 'react-i18next'

import { AccountButton } from '@/components/AccountButton'
import { BottomSheet } from '@/components/BottomSheet'
import { LanguageToggle } from '@/components/LanguageToggle'
import { SidebarNav } from '@/components/SidebarNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthDialog } from '@/features/auth/AuthDialog'
import { ChatWidget } from '@/features/chat/ChatWidget'
import { Sidebar, SidebarContent } from '@/features/layout/Sidebar'
import { MapView } from '@/features/map/MapView'
import { useAccountSync } from '@/hooks/useAccountSync'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useAppStore } from '@/store/useAppStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore'

function App() {
  const { t } = useTranslation()
  useAccountSync()
  const isMobile = useIsMobile()
  const { coords, error: geoError, loading: geoLoading } = useGeolocation()
  const selectPlace = useAppStore((state) => state.selectPlace)
  const selectedPlaceId = useAppStore((state) => state.selectedPlaceId)
  const customLocation = useAppStore((state) => state.customLocation)

  const categories = usePreferencesStore((state) => state.categories)
  const cuisines = usePreferencesStore((state) => state.cuisines)
  const maxDistance = usePreferencesStore((state) => state.maxDistance)
  const maxPrice = usePreferencesStore((state) => state.maxPrice)
  const openNow = usePreferencesStore((state) => state.openNow)
  const favorites = useSavedPlacesStore((state) => state.favorites)

  const favoriteIds = favorites.map((favorite) => favorite.id)
  const favoriteTypes = [...new Set(favorites.flatMap((favorite) => favorite.types))]

  // Aktif konum: kullanıcı bir konum aradıysa o, yoksa gerçek (geolocation) konum.
  const activeCoords = customLocation ?? coords
  const prefs = { categories, cuisines, maxDistance, maxPrice, openNow }
  const { data: recommended = [], isLoading, isError } = useRecommendations(
    activeCoords,
    prefs,
    favoriteIds,
    favoriteTypes,
  )

  // "Açık" tercihi seçiliyse yalnızca KESİN kapalı olanları gizle.
  // (Çalışma saati bilinmeyen mekanlar — open_now === null — listede kalır.)
  const places = openNow ? recommended.filter((place) => place.open_now !== false) : recommended

  const sidebarProps = {
    places,
    isLoading,
    isError,
    geoLoading,
    geoError,
    coords: activeCoords,
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {!isMobile && (
        <aside className="h-full w-[380px] shrink-0 overflow-y-auto border-r bg-background">
          <Sidebar {...sidebarProps} />
        </aside>
      )}

      <div className="relative flex-1">
        {activeCoords ? (
          <MapView
            center={activeCoords}
            userCoords={coords}
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={selectPlace}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted p-6 text-center text-muted-foreground">
            {geoError ?? t('app.waitingLocation')}
          </div>
        )}

        <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
          <AccountButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobil: içerik kayan panelde, navigasyon ise her zaman görünen sabit alt tab bar'da. */}
      {isMobile && (
        <>
          <BottomSheet>
            <SidebarContent {...sidebarProps} />
          </BottomSheet>
          <SidebarNav
            indicator="top"
            className="fixed inset-x-0 bottom-0 z-40 h-16 border-t bg-background/95 backdrop-blur"
          />
        </>
      )}

      <ChatWidget places={places} />
      <AuthDialog />
    </div>
  )
}

export default App
