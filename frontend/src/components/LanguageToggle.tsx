import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { changeLanguage, type Language } from '@/i18n'

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const next: Language = i18n.language === 'tr' ? 'en' : 'tr'

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => changeLanguage(next)}
      aria-label={t('lang.switch')}
    >
      <span className="text-xs font-semibold uppercase">{next}</span>
    </Button>
  )
}
