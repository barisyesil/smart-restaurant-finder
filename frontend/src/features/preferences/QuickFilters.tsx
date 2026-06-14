import { Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PreferencesSheet } from '@/features/preferences/PreferencesSheet'
import { cn } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'restaurant', label: 'Restoran' },
  { value: 'cafe', label: 'Kafe' },
  { value: 'fast_food', label: 'Fast Food' },
]

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn('h-8 shrink-0 rounded-full')}
    >
      {children}
    </Button>
  )
}

export function QuickFilters() {
  const categories = usePreferencesStore((state) => state.categories)
  const toggleCategory = usePreferencesStore((state) => state.toggleCategory)
  const openNow = usePreferencesStore((state) => state.openNow)
  const setOpenNow = usePreferencesStore((state) => state.setOpenNow)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CATEGORIES.map((category) => (
        <Chip
          key={category.value}
          active={categories.includes(category.value)}
          onClick={() => toggleCategory(category.value)}
        >
          {category.label}
        </Chip>
      ))}
      <Chip active={openNow} onClick={() => setOpenNow(!openNow)}>
        <Clock className="mr-1 h-3.5 w-3.5" />
        Açık
      </Chip>
      <PreferencesSheet />
    </div>
  )
}
