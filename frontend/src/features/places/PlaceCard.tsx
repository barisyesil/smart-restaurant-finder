import { Footprints, Sparkles, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
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
  score?: number
  reasons?: string[]
}

export function PlaceCard({ place, selected, onSelect, score, reasons }: PlaceCardProps) {
  const { t } = useTranslation()
  const { color, Icon } = getCategoryMeta(place.category)
  const label = t(`categories.${place.category}`)
  const price = formatPriceLevel(place.price_level, t('price.free'))
  const matchPercent = score != null ? Math.round(score) : null

  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl bg-card p-3 text-left shadow-sm transition-all',
        'hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-md',
        selected && 'ring-2 ring-primary',
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold leading-tight">{place.name}</p>
          {matchPercent != null && (
            <Badge className="shrink-0 bg-primary/10 font-semibold text-primary hover:bg-primary/10">
              {t('place.matchBadge', { percent: matchPercent })}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm">
          {place.rating != null && (
            <span className="flex items-center gap-0.5 font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {place.rating.toFixed(1)}
              {place.user_ratings_total != null && (
                <span className="font-normal text-muted-foreground">
                  ({place.user_ratings_total})
                </span>
              )}
            </span>
          )}
          <span className="text-muted-foreground">
            {place.rating != null ? '· ' : ''}
            {label}
          </span>
          {price && <span className="text-muted-foreground">· {price}</span>}
        </div>

        {place.address && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{place.address}</p>
        )}

        {reasons && reasons.length > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{reasons.join(' · ')}</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {place.open_now != null && (
            <Badge
              variant="secondary"
              className={cn(
                'border-transparent font-medium',
                place.open_now
                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
              )}
            >
              {place.open_now ? t('place.open') : t('place.closed')}
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1 border-transparent font-normal">
            <Footprints className="h-3 w-3" />
            {formatDistance(place.distance_m)} · {formatWalkingTime(place.distance_m, t('units.min'))}
          </Badge>
        </div>
      </div>
    </button>
  )
}
