import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [state, setState] = useState<GeolocationState>(() => ({
    coords: null,
    error: isSupported ? null : t('geo.unsupported'),
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
