import { Drawer } from 'vaul'
import { useState, type ReactNode } from 'react'

// Peek (özet) → yarı → tam ekran. Google Maps mobil deneyimi gibi.
const SNAP_POINTS = ['96px', '55%', '92%']

interface BottomSheetProps {
  children: ReactNode
  /** Değiştiğinde sheet'i tam yüksekliğe açar (örn. bir mekan seçilince). */
  expandKey?: string | null
}

export function BottomSheet({ children, expandKey }: BottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0])

  // Bir mekan seçilince (expandKey değişince) sheet'i tam yüksekliğe aç —
  // effect yerine render sırasında ayarlama (React'in önerdiği desen).
  const [prevExpandKey, setPrevExpandKey] = useState(expandKey)
  if (expandKey !== prevExpandKey) {
    setPrevExpandKey(expandKey)
    if (expandKey) setSnap(SNAP_POINTS[2])
  }

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
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-40 flex h-[92vh] flex-col rounded-t-2xl border border-b-0 bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none"
        >
          <Drawer.Title className="sr-only">Mekanlar</Drawer.Title>
          <div className="mx-auto mb-1 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
