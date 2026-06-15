import { LogIn, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore'

export function ProfilePanel() {
  const favorites = useSavedPlacesStore((state) => state.favorites)
  const wishlist = useSavedPlacesStore((state) => state.wishlist)
  const visited = useSavedPlacesStore((state) => state.visited)

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </span>
        <div>
          <p className="font-semibold">Misafir</p>
          <p className="text-xs text-muted-foreground">
            Giriş yaparak verilerini cihazlar arasında taşı
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

      <Button className="mt-4 w-full gap-2" disabled>
        <LogIn className="h-4 w-4" />
        Giriş yap
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Hesap sistemi yakında eklenecek (favori ve geçmişin hesabına bağlanacak).
      </p>
    </div>
  )
}
