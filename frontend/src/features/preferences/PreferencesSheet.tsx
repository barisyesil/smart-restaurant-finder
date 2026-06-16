import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { formatDistance } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'

const PRICE_VALUES: (number | null)[] = [null, 1, 2, 3, 4]

// Backend CUISINE_TYPES ile birebir aynı sırada tutulur (tek doğruluk kaynağı).
const CUISINE_VALUES = [
  'turkish_restaurant',
  'italian_restaurant',
  'chinese_restaurant',
  'japanese_restaurant',
  'sushi_restaurant',
  'korean_restaurant',
  'thai_restaurant',
  'indian_restaurant',
  'mexican_restaurant',
  'french_restaurant',
  'greek_restaurant',
  'mediterranean_restaurant',
  'middle_eastern_restaurant',
  'american_restaurant',
  'vietnamese_restaurant',
  'lebanese_restaurant',
  'spanish_restaurant',
  'pizza_restaurant',
  'hamburger_restaurant',
  'sandwich_shop',
  'fast_food_restaurant',
  'seafood_restaurant',
  'steak_house',
  'barbecue_restaurant',
  'vegetarian_restaurant',
  'vegan_restaurant',
  'ramen_restaurant',
  'breakfast_restaurant',
  'brunch_restaurant',
  'coffee_shop',
  'dessert_shop',
  'ice_cream_shop',
  'bakery',
  'bar',
  'pub',
  'wine_bar',
]

export function PreferencesSheet() {
  const { t } = useTranslation()
  const maxDistance = usePreferencesStore((state) => state.maxDistance)
  const setMaxDistance = usePreferencesStore((state) => state.setMaxDistance)
  const maxPrice = usePreferencesStore((state) => state.maxPrice)
  const setMaxPrice = usePreferencesStore((state) => state.setMaxPrice)
  const cuisines = usePreferencesStore((state) => state.cuisines)
  const toggleCuisine = usePreferencesStore((state) => state.toggleCuisine)
  const reset = usePreferencesStore((state) => state.reset)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t('filters.button')}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[360px]">
        <SheetHeader>
          <SheetTitle>{t('filters.title')}</SheetTitle>
          <SheetDescription>{t('filters.description')}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{t('filters.maxDistance')}</Label>
              <span className="text-sm font-medium text-muted-foreground">
                {formatDistance(maxDistance)}
              </span>
            </div>
            <Slider
              min={250}
              max={20000}
              step={250}
              value={[maxDistance]}
              onValueChange={(value) => setMaxDistance(value[0])}
            />
          </div>

          <div>
            <Label className="mb-2 block">{t('filters.cuisine')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {CUISINE_VALUES.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={cuisines.includes(value) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => toggleCuisine(value)}
                >
                  {t(`cuisines.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t('filters.priceRange')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_VALUES.map((value) => (
                <Button
                  key={value ?? 'any'}
                  type="button"
                  variant={maxPrice === value ? 'default' : 'outline'}
                  size="sm"
                  className={cn('rounded-full')}
                  onClick={() => setMaxPrice(value)}
                >
                  {value === null ? t('filters.anyPrice') : '₺'.repeat(value)}
                </Button>
              ))}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={reset} className="self-start">
            {t('filters.reset')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
