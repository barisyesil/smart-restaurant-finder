import { Bookmark, CheckCheck, Compass, Heart, User, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { useAppStore, type SidebarView } from '@/store/useAppStore'

const ITEMS: { view: SidebarView; labelKey: string; Icon: LucideIcon }[] = [
  { view: 'discover', labelKey: 'nav.discover', Icon: Compass },
  { view: 'favorites', labelKey: 'nav.favorites', Icon: Heart },
  { view: 'wishlist', labelKey: 'nav.wishlist', Icon: Bookmark },
  { view: 'visited', labelKey: 'nav.visited', Icon: CheckCheck },
  { view: 'profile', labelKey: 'nav.profile', Icon: User },
]

interface SidebarNavProps {
  /** Aktif vurgu çizgisinin konumu: masaüstünde altta, mobil alt-bar'da üstte. */
  indicator?: 'top' | 'bottom'
  className?: string
}

export function SidebarNav({ indicator = 'bottom', className }: SidebarNavProps) {
  const { t } = useTranslation()
  const view = useAppStore((state) => state.view)
  const setView = useAppStore((state) => state.setView)

  return (
    <nav className={cn('flex bg-background', className)}>
      {ITEMS.map(({ view: itemView, labelKey, Icon }) => {
        const active = view === itemView
        return (
          <button
            key={itemView}
            type="button"
            onClick={() => setView(itemView)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {t(labelKey)}
            {active && (
              <span
                className={cn(
                  'absolute inset-x-4 h-0.5 rounded-full bg-primary',
                  indicator === 'top' ? 'top-0' : 'bottom-0',
                )}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
