import { SlidersHorizontal } from 'lucide-react'

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

const PRICE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Farketmez', value: null },
  { label: '₺', value: 1 },
  { label: '₺₺', value: 2 },
  { label: '₺₺₺', value: 3 },
  { label: '₺₺₺₺', value: 4 },
]

const CUISINE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Türk', value: 'turkish_restaurant' },
  { label: 'Pizza', value: 'pizza_restaurant' },
  { label: 'Burger', value: 'hamburger_restaurant' },
  { label: 'Kahve', value: 'coffee_shop' },
  { label: 'Tatlı', value: 'dessert_shop' },
  { label: 'Deniz Ürünleri', value: 'seafood_restaurant' },
  { label: 'Fırın', value: 'bakery' },
  { label: 'Bar', value: 'bar' },
]

export function PreferencesSheet() {
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
          Filtreler
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[360px]">
        <SheetHeader>
          <SheetTitle>Tercihlerin</SheetTitle>
          <SheetDescription>Öneriler bu tercihlere göre yeniden sıralanır.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Maksimum mesafe</Label>
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
            <Label className="mb-2 block">Mutfak</Label>
            <div className="flex flex-wrap gap-1.5">
              {CUISINE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={cuisines.includes(option.value) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => toggleCuisine(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Fiyat aralığı</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={maxPrice === option.value ? 'default' : 'outline'}
                  size="sm"
                  className={cn('rounded-full')}
                  onClick={() => setMaxPrice(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={reset} className="self-start">
            Tercihleri sıfırla
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
