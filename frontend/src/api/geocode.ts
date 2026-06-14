export interface GeocodeResult {
  label: string
  lat: number
  lon: number
}

interface NominatimItem {
  display_name: string
  lat: string
  lon: string
}

// Nominatim (OpenStreetMap) ücretsiz geocoding — API anahtarı gerektirmez.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')

  const response = await fetch(url, { headers: { 'Accept-Language': 'tr' } })
  if (!response.ok) {
    throw new Error('Konum araması başarısız oldu.')
  }

  const data = (await response.json()) as NominatimItem[]
  return data.map((item) => ({
    label: item.display_name,
    lat: Number.parseFloat(item.lat),
    lon: Number.parseFloat(item.lon),
  }))
}
