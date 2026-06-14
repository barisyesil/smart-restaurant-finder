import { CheckCheck, Compass, Heart, User, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type SidebarView } from '@/store/useAppStore'

const ITEMS: { view: SidebarView; label: string; Icon: LucideIcon }[] = [
  { view: 'discover', label: 'Keşfet', Icon: Compass },
  { view: 'favorites', label: 'Favoriler', Icon: Heart },
  { view: 'visited', label: 'Gittiklerim', Icon: CheckCheck },
  { view: 'profile', label: 'Profil', Icon: User },
]

export function SidebarNav() {
  const view = useAppStore((state) => state.view)
  const setView = useAppStore((state) => state.setView)

  return (
    <nav className="flex border-b bg-background">
      {ITEMS.map(({ view: itemView, label, Icon }) => {
        const active = view === itemView
        return (
          <button
            key={itemView}
            type="button"
            onClick={() => setView(itemView)}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
            {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        )
      })}
    </nav>
  )
}
