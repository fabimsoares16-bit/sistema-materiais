'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, senha)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--primary-950) 0%, var(--primary-800) 50%, var(--primary-900) 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sistema de Códigos de Materiais
          </h1>
          <p className="text-[var(--primary-300)] mt-1 text-sm">
            Disciplina Elétrica — Gerador de Códigos Padronizados
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Entrar no sistema
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium animate-fade-in"
              style={{
                background: 'var(--error)',
                color: 'white',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sistema.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 outline-none"
                style={{
                  borderColor: 'var(--surface-border)',
                  background: 'var(--surface-bg)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border text-sm transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'var(--surface-border)',
                    background: 'var(--surface-bg)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: loading
                  ? 'var(--primary-400)'
                  : 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
              Credenciais de demonstração
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setEmail('admin@sistema.com'); setSenha('admin123') }}
                className="text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)]"
                style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
              >
                <span className="badge badge-info mb-1">Admin</span>
                <p className="text-xs text-[var(--text-secondary)] mt-1">admin@sistema.com</p>
                <p className="text-xs text-[var(--text-muted)]">admin123</p>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('projetista@sistema.com'); setSenha('proj123') }}
                className="text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:border-[var(--accent-400)] hover:bg-amber-50"
                style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
              >
                <span className="badge badge-warning mb-1">Projetista</span>
                <p className="text-xs text-[var(--text-secondary)] mt-1">projetista@sistema.com</p>
                <p className="text-xs text-[var(--text-muted)]">proj123</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
