import { formatDistance, getCategoryMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Place } from '@/types/place'

interface PlaceCardProps {
  place: Place
  selected: boolean
  onSelect: (id: number) => void
}

export function PlaceCard({ place, selected, onSelect }: PlaceCardProps) {
  const meta = getCategoryMeta(place.category)

  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
        selected && 'border-primary bg-accent',
      )}
    >
      <span className="text-2xl">{meta.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.name}</p>
        <p className="text-sm text-muted-foreground">
          {meta.label}
          {place.cuisine ? ` · ${place.cuisine}` : ''}
        </p>
        {place.address && <p className="truncate text-xs text-muted-foreground">{place.address}</p>}
      </div>
      <span className="shrink-0 text-sm font-medium text-primary">
        {formatDistance(place.distance_m)}
      </span>
    </button>
  )
}
