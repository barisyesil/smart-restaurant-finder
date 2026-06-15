import { useEffect, useRef } from 'react'

import { addSaved, getPreferences, getSaved, putPreferences } from '@/api/me'
import { useAuthStore } from '@/store/useAuthStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore'

/**
 * Giriş yapan kullanıcı için yerel (misafir) veriyi sunucuya taşır ve sunucu
 * verisini çeker; tercih değişimlerini sunucuya yazar; çıkışta yereli temizler.
 */
export function useAccountSync() {
  const token = useAuthStore((state) => state.token)
  const userId = useAuthStore((state) => state.user?.id)

  const categories = usePreferencesStore((state) => state.categories)
  const cuisines = usePreferencesStore((state) => state.cuisines)
  const maxDistance = usePreferencesStore((state) => state.maxDistance)
  const maxPrice = usePreferencesStore((state) => state.maxPrice)
  const openNow = usePreferencesStore((state) => state.openNow)

  // Giriş: yerel veriyi yükle, sonra sunucudan çek.
  useEffect(() => {
    if (!token || userId == null) return
    let cancelled = false
    const saved = useSavedPlacesStore.getState()
    const prefs = usePreferencesStore.getState()

    const run = async () => {
      try {
        await Promise.all([
          ...saved.favorites.map((place) => addSaved('favorite', place)),
          ...saved.wishlist.map((place) => addSaved('wishlist', place)),
          ...saved.visited.map((place) => addSaved('visited', place)),
          putPreferences(prefs),
        ])
        const [serverSaved, serverPrefs] = await Promise.all([getSaved(), getPreferences()])
        if (cancelled) return
        useSavedPlacesStore.getState().setAll(serverSaved)
        usePreferencesStore.getState().setAll(serverPrefs)
      } catch {
        // sunucu yok / çevrimdışı → sessizce yerelde devam
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token, userId])

  // Tercih değişince (gecikmeli) sunucuya yaz.
  useEffect(() => {
    if (!token) return
    const handle = setTimeout(() => {
      putPreferences({ categories, cuisines, maxDistance, maxPrice, openNow }).catch(() => {})
    }, 700)
    return () => clearTimeout(handle)
  }, [token, categories, cuisines, maxDistance, maxPrice, openNow])

  // Çıkış: yerel veriyi temizle (veriler sunucuda saklı).
  const prevToken = useRef<string | null>(token)
  useEffect(() => {
    if (prevToken.current && !token) {
      useSavedPlacesStore.setState({ favorites: [], wishlist: [], visited: [] })
      usePreferencesStore.getState().reset()
    }
    prevToken.current = token
  }, [token])
}
