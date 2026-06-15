import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
            ? t('auth.wrongCredentials')
            : t('auth.loginFailed')
          : status === 409
            ? t('auth.emailTaken')
            : t('auth.registerFailed'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</DialogTitle>
          <DialogDescription>{t('auth.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">{t('auth.email')}</Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">{t('auth.password')}</Label>
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
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
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
          {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
        </button>
      </DialogContent>
    </Dialog>
  )
}
