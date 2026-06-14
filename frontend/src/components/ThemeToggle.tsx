import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/providers/theme-context'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun className="h-5 w-5 scale-100 transition-all dark:scale-0" />
          <Moon className="absolute h-5 w-5 scale-0 transition-all dark:scale-100" />
          <span className="sr-only">Tema değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Açık</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Koyu</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>Sistem</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
