export interface Place {
  id: number
  name: string
  category: string // restaurant | cafe | fast_food
  cuisine: string | null
  address: string | null
  lat: number
  lon: number
  distance_m: number
}
