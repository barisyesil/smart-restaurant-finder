import { ChevronDown } from 'lucide-react'
import { Drawer } from 'vaul'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { SHEET_PEEK, useAppStore } from '@/store/useAppStore'

// Peek (özet) → yarı → tam. Son nokta 1 = tam yükseklik.
const SNAP_POINTS: (number | string)[] = [SHEET_PEEK, '50%', 1]

interface BottomSheetProps {
  children: ReactNode
}

export function BottomSheet({ children }: BottomSheetProps) {
  // Snap durumu global store'da: nav sekmesi / mekan seçimi sheet'i programatik açabilsin.
  const snap = useAppStore((state) => state.sheetSnap)
  const setSnap = useAppStore((state) => state.setSheetSnap)

  const expanded = snap === 1

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={(value) => setSnap(value ?? SHEET_PEEK)}
    >
      <Drawer.Portal>
        <Drawer.Content
          // overscroll-contain: aşağı sürüklerken tarayıcının pull-to-refresh'ini engeller.
          className="fixed inset-x-0 bottom-0 z-40 flex h-full max-h-[97%] flex-col overflow-hidden overscroll-contain rounded-t-2xl border border-b-0 bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none"
        >
          <Drawer.Title className="sr-only">Mekanlar</Drawer.Title>

          {/* Sürükleme tutamacı + (tam açıkken) collapse butonu */}
          <div className="relative shrink-0">
            <div className="mx-auto my-3 h-1.5 w-10 rounded-full bg-muted" />
            {expanded && (
              <button
                type="button"
                onClick={() => setSnap(SHEET_PEEK)}
                aria-label="Listeyi küçült"
                className="absolute right-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Tek scroll konteyneri: yalnızca tam açıkken scroll, aksi halde sürükleme çalışsın */}
          <div
            className={cn(
              'min-h-0 flex-1 overscroll-contain',
              expanded ? 'overflow-y-auto' : 'overflow-hidden',
            )}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
