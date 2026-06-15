import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { getMe, login, register } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

export function AuthDialog() {
  const open = useAppStore((state) => state.authDialogOpen)
  const setOpen = useAppStore((state) => state.setAuthDialogOpen)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = mode === 'login' ? await login(email, password) : await register(email, password)
      useAuthStore.setState({ token: result.access_token })
      const user = await getMe()
      useAuthStore.getState().setAuth(result.access_token, user)
      setOpen(false)
      setEmail('')
      setPassword('')
    } catch (err) {
      const status = (err as { status?: number }).status
      setError(
        mode === 'login'
          ? status === 401
            ? 'E-posta veya parola hatalı.'
            : 'Giriş başarısız oldu.'
          : status === 409
            ? 'Bu e-posta zaten kayıtlı.'
            : 'Kayıt başarısız oldu.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</DialogTitle>
          <DialogDescription>
            Favori, gidilecek ve gittiğin yerleri hesabına kaydet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">E-posta</Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Parola</Label>
            <Input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
        </button>
      </DialogContent>
    </Dialog>
  )
}
