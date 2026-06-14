import { Footprints, Star } from 'lucide-react'

import {
  formatDistance,
  formatPriceLevel,
  formatWalkingTime,
  getCategoryMeta,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Place } from '@/types/place'

interface PlaceCardProps {
  place: Place
  selected: boolean
  onSelect: (id: string) => void
}

export function PlaceCard({ place, selected, onSelect }: PlaceCardProps) {
  const { label, color, Icon } = getCategoryMeta(place.category)
  const price = formatPriceLevel(place.price_level)

  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-accent',
        selected && 'border-border bg-accent',
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.name}</p>

        <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span>{label}</span>
          {place.rating != null && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {place.rating.toFixed(1)}
              {place.user_ratings_total != null && (
                <span className="text-xs">({place.user_ratings_total})</span>
              )}
            </span>
          )}
          {price && <span>· {price}</span>}
        </div>

        {place.open_now != null && (
          <span
            className={cn(
              'text-xs font-medium',
              place.open_now ? 'text-green-600' : 'text-destructive',
            )}
          >
            {place.open_now ? 'Açık' : 'Kapalı'}
          </span>
        )}
        {place.address && <p className="truncate text-xs text-muted-foreground">{place.address}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-medium text-foreground">
          {formatDistance(place.distance_m)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Footprints className="h-3 w-3" />
          {formatWalkingTime(place.distance_m)}
        </span>
      </div>
    </button>
  )
}
