'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Code2,
  Search,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gerador', label: 'Gerador de Códigos', icon: Code2 },
  { href: '/consulta', label: 'Consulta / Busca', icon: Search },
]

const ADMIN_ITEMS = [
  { href: '/admin/hierarquia', label: 'Gestão da Hierarquia', icon: Settings },
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { usuario, isLoading, logout, isAdmin } = useAuth()

  useEffect(() => {
    if (!isLoading && !usuario) {
      router.replace('/login')
    }
  }, [usuario, isLoading, router])

  if (isLoading || !usuario) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle text-[var(--text-muted)]">
          Carregando...
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col shrink-0"
        style={{
          background: 'linear-gradient(180deg, var(--primary-950) 0%, var(--primary-900) 100%)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">SCM</h1>
            <p className="text-[10px] text-[var(--primary-300)]">Códigos de Materiais</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--primary-400)]">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? 'var(--primary-200)' : 'var(--primary-300)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                    ;(e.currentTarget as HTMLElement).style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--primary-300)'
                  }
                }}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-4 mx-3 border-t border-white/10" />
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
                Administração
              </p>
              {ADMIN_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      color: isActive ? 'var(--accent-400)' : 'var(--primary-300)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                        ;(e.currentTarget as HTMLElement).style.color = 'white'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--primary-300)'
                      }
                    }}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: usuario.perfil === 'ADMIN'
                  ? 'linear-gradient(135deg, var(--primary-400), var(--primary-600))'
                  : 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
              }}
            >
              {usuario.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{usuario.nome}</p>
              <p className="text-[10px] text-[var(--primary-400)]">
                {usuario.perfil === 'ADMIN' ? '🔑 Administrador' : '📐 Projetista'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[var(--primary-400)] hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
