import { ArrowLeft, ExternalLink, Globe, Heart, Phone, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlaceDetails } from '@/hooks/usePlaceDetails'
import { formatPriceLevel, getCategoryMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import type { Place } from '@/types/place'

interface PlaceDetailProps {
  placeId: string
  summary?: Place
  onClose: () => void
}

export function PlaceDetail({ placeId, summary, onClose }: PlaceDetailProps) {
  const { data: detail, isLoading, isError } = usePlaceDetails(placeId)
  const favoriteIds = useFavoritesStore((state) => state.ids)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const isFavorite = favoriteIds.includes(placeId)

  const place = detail ?? summary
  const meta = getCategoryMeta(place?.category ?? 'restaurant')
  const Icon = meta.Icon
  const price = formatPriceLevel(place?.price_level ?? null)

  return (
    <div>
      <div className="relative h-44 bg-muted">
        {detail?.photo_uri ? (
          <img src={detail.photo_uri} alt={place?.name} className="h-full w-full object-cover" />
        ) : isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ color: meta.color }}>
            <Icon className="h-12 w-12 opacity-40" />
          </div>
        )}
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          className="absolute left-2 top-2 rounded-full shadow"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => toggleFavorite(placeId)}
          className="absolute right-2 top-2 rounded-full shadow"
          aria-label="Favorilere ekle"
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
        </Button>
      </div>

      <div className="p-4">
        {isError && !summary ? (
          <p className="text-sm text-destructive">Detaylar yüklenemedi.</p>
        ) : (
          <>
            <h2 className="text-lg font-semibold">{place?.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>{meta.label}</span>
              {place?.rating != null && (
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {place.rating.toFixed(1)}
                  {place.user_ratings_total != null && <span>({place.user_ratings_total})</span>}
                </span>
              )}
              {price && <span>· {price}</span>}
              {place?.open_now != null && (
                <span
                  className={cn(
                    'font-medium',
                    place.open_now ? 'text-green-600' : 'text-destructive',
                  )}
                >
                  · {place.open_now ? 'Açık' : 'Kapalı'}
                </span>
              )}
            </div>

            {detail?.editorial_summary && <p className="mt-3 text-sm">{detail.editorial_summary}</p>}
            {place?.address && <p className="mt-3 text-sm text-muted-foreground">{place.address}</p>}

            {isLoading && !detail ? (
              <Skeleton className="mt-4 h-20 w-full" />
            ) : detail?.opening_hours.length ? (
              <div className="mt-4">
                <p className="mb-1 text-sm font-medium">Çalışma Saatleri</p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {detail.opening_hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-2">
              {detail?.phone && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={`tel:${detail.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {detail.phone}
                  </a>
                </Button>
              )}
              {detail?.website && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={detail.website} target="_blank" rel="noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Web sitesi
                  </a>
                </Button>
              )}
              {detail?.google_maps_uri && (
                <Button asChild className="justify-start">
                  <a href={detail.google_maps_uri} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Google Haritalar'da aç
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
