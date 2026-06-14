import { useEffect, useState } from 'react'

export interface Coordinates {
  lat: number
  lon: number
}

interface GeolocationState {
  coords: Coordinates | null
  error: string | null
  loading: boolean
}

const isSupported = 'geolocation' in navigator

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => ({
    coords: null,
    error: isSupported ? null : 'Tarayıcınız konum desteği sunmuyor.',
    loading: isSupported,
  }))

  useEffect(() => {
    if (!isSupported) return

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          coords: { lat: position.coords.latitude, lon: position.coords.longitude },
          error: null,
          loading: false,
        }),
      (error) => setState({ coords: null, error: error.message, loading: false }),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return state
}
