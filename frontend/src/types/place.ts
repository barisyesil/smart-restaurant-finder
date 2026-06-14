export interface Place {
  id: string
  name: string
  category: string // restaurant | cafe | fast_food
  types: string[]
  rating: number | null
  user_ratings_total: number | null
  price_level: number | null // 0 (ücretsiz) – 4 (çok pahalı)
  address: string | null
  lat: number
  lon: number
  distance_m: number
  open_now: boolean | null
  photo_name: string | null
}

export interface RecommendedPlace extends Place {
  score: number
  reasons: string[]
}

export interface PlaceDetail {
  id: string
  name: string
  category: string
  types: string[]
  rating: number | null
  user_ratings_total: number | null
  price_level: number | null
  address: string | null
  lat: number
  lon: number
  open_now: boolean | null
  phone: string | null
  website: string | null
  google_maps_uri: string | null
  opening_hours: string[]
  photo_uri: string | null
  editorial_summary: string | null
}
