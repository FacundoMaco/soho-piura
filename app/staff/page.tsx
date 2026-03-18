'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function StaffPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    router.push('/agenda')
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="text-3xl font-black tracking-tight uppercase mb-2 text-[#0a0a0a]">
            SOHO<span className="text-[#E8192C]">●</span>.color
          </p>
          <p className="text-sm text-[#666666]">Acceso staff</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#e0e0e0] px-8 py-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-[#666666]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@sohocolor.pe"
              className="w-full rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] px-4 py-3 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#E8192C] focus:ring-1 focus:ring-[#E8192C]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-[#666666]" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] px-4 py-3 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#E8192C] focus:ring-1 focus:ring-[#E8192C]"
            />
          </div>

          {error && (
            <p className="text-sm text-[#E8192C]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#E8192C] hover:bg-[#c91526] py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
