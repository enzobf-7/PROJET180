'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import GlcLogo from '@/components/GlcLogo'
import { GlcInput } from '@/components/GlcInput'
import { GlcButton } from '@/components/GlcButton'

const DEMO_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_SEED_TEST_USER === 'true'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError('')

    try {
      const res = await fetch('/api/dev/create-test-user', { method: 'POST' })
      if (!res.ok) throw new Error('failed')

      const { email: demoEmail, password: demoPassword } = await res.json()
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (error) {
        setError(`Impossible de connecter l'utilisateur de démo.`)
        return
      }

      router.refresh()
    } catch {
      setError(`Impossible de créer l'utilisateur de démo.`)
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,26,26,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-glc-accent/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10 animate-fade-in">
        {/* Logo + heading */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <GlcLogo size="xl" />
          </div>
          <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.06em', color: '#F2F2F5', textTransform: 'uppercase', marginBottom: 6, whiteSpace: 'nowrap' }}>
            Gentleman Létal Club
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.03em' }}>
            Connecte-toi pour accéder à ton espace
          </p>
        </div>

        {/* Form card */}
        <div className="bg-glc-card border border-glc-border rounded-2xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <GlcInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              autoComplete="email"
            />

            <GlcInput
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="text-[#ff6b6b] text-sm bg-[rgba(139,26,26,0.12)] border border-[rgba(139,26,26,0.25)] rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <GlcButton
              type="submit"
              loading={loading}
              disabled={demoLoading}
              fullWidth
              className="mt-1"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </GlcButton>

            {DEMO_LOGIN_ENABLED && (
              <GlcButton
                type="button"
                variant="ghost"
                onClick={handleDemoLogin}
                loading={demoLoading}
                disabled={loading}
                fullWidth
              >
                {demoLoading ? 'Connexion de démo…' : 'Connexion de démo (auto)'}
              </GlcButton>
            )}
          </form>
        </div>

        <p className="text-center text-glc-muted/40 text-xs mt-8 tracking-wide">
          Gentleman Létal Club · 180 jours
        </p>
      </div>
    </div>
  )
}
