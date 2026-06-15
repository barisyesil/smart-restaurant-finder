import { Loader2, MapPin, Navigation, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { geocode, type GeocodeResult } from '@/api/geocode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

export function LocationSearch() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const customLocation = useAppStore((state) => state.customLocation)
  const setCustomLocation = useAppStore((state) => state.setCustomLocation)
  const selectPlace = useAppStore((state) => state.selectPlace)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      setResults(await geocode(query.trim()))
    } finally {
      setLoading(false)
    }
  }

  function choose(result: GeocodeResult) {
    setCustomLocation({ lat: result.lat, lon: result.lon })
    selectPlace(null)
    setResults([])
    setQuery(result.label.split(',')[0])
  }

  function resetToMyLocation() {
    setCustomLocation(null)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative mt-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('location.placeholder')}
            className="pl-8"
          />
        </div>
        <Button type="submit" size="icon" variant="secondary" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {customLocation && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={resetToMyLocation}
        >
          <Navigation className="h-3 w-3" /> {t('location.backToMine')}
        </Button>
      )}

      {results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
          {results.map((result) => (
            <li key={`${result.lat},${result.lon}`}>
              <button
                type="button"
                onClick={() => choose(result)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
