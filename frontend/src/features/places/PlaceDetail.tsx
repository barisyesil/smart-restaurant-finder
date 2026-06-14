import { ArrowLeft, Check, Globe, Heart, Navigation, Phone, Share2, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlaceDetails } from '@/hooks/usePlaceDetails'
import { formatPriceLevel, getCategoryMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSavedPlacesStore, type SavedPlace } from '@/store/useSavedPlacesStore'
import type { Place } from '@/types/place'

interface PlaceDetailProps {
  placeId: string
  summary?: Place
  onClose: () => void
}

export function PlaceDetail({ placeId, summary, onClose }: PlaceDetailProps) {
  const { data: detail, isLoading, isError } = usePlaceDetails(placeId)
  const favorites = useSavedPlacesStore((state) => state.favorites)
  const visited = useSavedPlacesStore((state) => state.visited)
  const toggleFavorite = useSavedPlacesStore((state) => state.toggleFavorite)
  const toggleVisited = useSavedPlacesStore((state) => state.toggleVisited)

  const isFavorite = favorites.some((item) => item.id === placeId)
  const isVisited = visited.some((item) => item.id === placeId)

  const place = detail ?? summary
  const meta = getCategoryMeta(place?.category ?? 'restaurant')
  const Icon = meta.Icon
  const price = formatPriceLevel(place?.price_level ?? null)

  function buildSaved(): SavedPlace | null {
    if (!place) return null
    return {
      id: placeId,
      name: place.name,
      category: place.category,
      types: place.types ?? [],
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      lat: place.lat,
      lon: place.lon,
    }
  }

  function handleFavorite() {
    const saved = buildSaved()
    if (saved) toggleFavorite(saved)
  }

  function handleVisited() {
    const saved = buildSaved()
    if (saved) toggleVisited(saved)
  }

  async function handleShare() {
    if (!place) return
    const url =
      detail?.google_maps_uri ??
      `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // kullanıcı paylaşımı iptal etti — sessizce geç
    }
  }

  const directionsUrl = place
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&destination_place_id=${placeId}`
    : '#'

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
          onClick={handleFavorite}
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

            {/* Hızlı aksiyonlar */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button asChild variant="outline" className="h-auto flex-col gap-1 py-2">
                <a href={directionsUrl} target="_blank" rel="noreferrer">
                  <Navigation className="h-4 w-4" />
                  <span className="text-xs">Nasıl giderim</span>
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1 py-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs">Paylaş</span>
              </Button>
              <Button
                variant={isVisited ? 'default' : 'outline'}
                className="h-auto flex-col gap-1 py-2"
                onClick={handleVisited}
              >
                <Check className="h-4 w-4" />
                <span className="text-xs">{isVisited ? 'Gidildi' : 'Gittim'}</span>
              </Button>
            </div>

            {detail?.editorial_summary && <p className="mt-4 text-sm">{detail.editorial_summary}</p>}
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
