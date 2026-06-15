import { LogIn, LogOut, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore'

export function ProfilePanel() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const setAuthDialogOpen = useAppStore((state) => state.setAuthDialogOpen)

  const favorites = useSavedPlacesStore((state) => state.favorites)
  const wishlist = useSavedPlacesStore((state) => state.wishlist)
  const visited = useSavedPlacesStore((state) => state.visited)

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{user ? user.email : 'Misafir'}</p>
          <p className="text-xs text-muted-foreground">
            {user ? 'Giriş yapıldı' : 'Giriş yaparak verilerini cihazlar arasında taşı'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold">{favorites.length}</p>
          <p className="text-xs text-muted-foreground">Favori</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold">{wishlist.length}</p>
          <p className="text-xs text-muted-foreground">Gidilecek</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold">{visited.length}</p>
          <p className="text-xs text-muted-foreground">Gidilen</p>
        </div>
      </div>

      {user ? (
        <Button variant="outline" className="mt-4 w-full gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Çıkış yap
        </Button>
      ) : (
        <Button className="mt-4 w-full gap-2" onClick={() => setAuthDialogOpen(true)}>
          <LogIn className="h-4 w-4" />
          Giriş yap / Kayıt ol
        </Button>
      )}
    </div>
  )
}
