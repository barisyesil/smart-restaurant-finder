import { LogOut, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

export function AccountButton() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const setAuthDialogOpen = useAppStore((state) => state.setAuthDialogOpen)

  if (!user) {
    return (
      <Button size="sm" className="rounded-full shadow" onClick={() => setAuthDialogOpen(true)}>
        Giriş yap
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full shadow">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[200px] truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
