import { Drawer } from 'vaul'
import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Peek (özet) → yarı → tam. Son nokta 1 = tam yükseklik.
const SNAP_POINTS: (number | string)[] = ['110px', '50%', 1]

interface BottomSheetProps {
  children: ReactNode
  /** Değiştiğinde sheet'i tam yüksekliğe açar (örn. bir mekan seçilince). */
  expandKey?: string | null
}

export function BottomSheet({ children, expandKey }: BottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0])

  // Bir mekan seçilince sheet'i tam aç (effect yerine render sırasında ayarlama).
  const [prevExpandKey, setPrevExpandKey] = useState(expandKey)
  if (expandKey !== prevExpandKey) {
    setPrevExpandKey(expandKey)
    if (expandKey) setSnap(1)
  }

  const expanded = snap === 1

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex h-full max-h-[97%] flex-col rounded-t-2xl border border-b-0 bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none">
          <Drawer.Title className="sr-only">Mekanlar</Drawer.Title>
          {/* Sürükleme tutamacı */}
          <div className="mx-auto my-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
          {/* Tek scroll konteyneri: yalnızca tam açıkken scroll, aksi halde sürükleme çalışsın */}
          <div className={cn('min-h-0 flex-1', expanded ? 'overflow-y-auto' : 'overflow-hidden')}>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
