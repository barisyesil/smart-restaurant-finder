import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeProviderState | undefined>(undefined)

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme bir ThemeProvider içinde kullanılmalıdır')
  }
  return context
}
