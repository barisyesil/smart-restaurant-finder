import { ChevronDown } from 'lucide-react'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

/**
 * Mobil içerik paneli. Snap-point sürükleme yerine iki net durum (açık/kapalı) ve
 * `translate-y` animasyonu kullanır — kontroller deterministik ve sağlam. Açık panel
 * üst kontrollerin (top-16) altında başlar, alt tab bar'ın (bottom-16) üstünde biter.
 */
export function BottomSheet({ children }: { children: ReactNode }) {
  const open = useAppStore((state) => state.sheetOpen)
  const setOpen = useAppStore((state) => state.setSheetOpen)

  return (
    <>
      {/* Karartma: açıkken görünen harita kısmına dokununca paneli kapatır */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 sm:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-x-0 bottom-16 top-16 z-40 flex flex-col overflow-hidden rounded-t-3xl',
          'border border-b-0 bg-background shadow-[0_-12px_40px_rgba(0,0,0,0.18)]',
          'transition-transform duration-300 ease-out sm:hidden',
          open ? 'translate-y-0' : 'translate-y-[120%]',
        )}
      >
        {/* Tüm başlık alanı tıklanabilir kapatma bölgesi: geniş dokunma hedefi, kırpılma yok */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Paneli kapat"
          className="flex w-full shrink-0 flex-col items-center gap-1 pb-2 pt-3 text-muted-foreground transition-colors active:bg-muted/60"
        >
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
          <ChevronDown className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </>
  )
}
