import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import tr from './locales/tr.json'

export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'lang'

function initialLanguage(): Language {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'tr' || stored === 'en') return stored
  }
  return 'tr' // proje varsayılanı Türkçe
}

const lng = initialLanguage()

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'tr',
  interpolation: { escapeValue: false }, // React zaten XSS'e karşı kaçışlar
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = lng
}

export function changeLanguage(language: Language): void {
  i18n.changeLanguage(language)
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, language)
  if (typeof document !== 'undefined') document.documentElement.lang = language
}

export default i18n
