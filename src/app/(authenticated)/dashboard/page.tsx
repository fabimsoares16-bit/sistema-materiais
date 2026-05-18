'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Layers,
  FolderTree,
  GitBranch,
  Code2,
  Search,
  TrendingUp,
  Clock,
} from 'lucide-react'
import type { DashboardStats, Material } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CHART_COLORS = [
  'var(--primary-500)',
  'var(--primary-400)',
  'var(--primary-600)',
  'var(--accent-500)',
  '#10b981',
  '#8b5cf6',
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'Total de Materiais',
      value: stats.totalMateriais,
      icon: Package,
      gradient: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
      shadow: 'rgba(37, 99, 235, 0.3)',
    },
    {
      label: 'Disciplinas',
      value: stats.totalDisciplinas,
      icon: Layers,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      shadow: 'rgba(16, 185, 129, 0.3)',
    },
    {
      label: 'Grupos',
      value: stats.totalGrupos,
      icon: GitBranch,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
    {
      label: 'Famílias',
      value: stats.totalFamilias,
      icon: FolderTree,
      gradient: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Visão geral do sistema de códigos de materiais
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="rounded-xl p-5 text-white card-hover animate-fade-in"
            style={{
              background: card.gradient,
              boxShadow: `0 8px 24px ${card.shadow}`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5 opacity-80" />
              <TrendingUp className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm opacity-80 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart */}
        <div
          className="rounded-xl p-6 animate-fade-in"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--surface-border)',
            animationDelay: '0.2s',
          }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary-500)]" />
            Materiais por Disciplina
          </h2>
          {stats.porDisciplina.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.porDisciplina}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis
                  dataKey="nome"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {stats.porDisciplina.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[var(--text-muted)] text-sm">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Recent Materials */}
        <div
          className="rounded-xl p-6 animate-fade-in"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--surface-border)',
            animationDelay: '0.25s',
          }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary-500)]" />
            Últimos Códigos Criados
          </h2>
          {stats.recentes.length > 0 ? (
            <div className="space-y-2">
              {stats.recentes.map((mat: Material) => (
                <Link
                  key={mat.id}
                  href={`/materiais/${mat.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                  style={{ background: 'var(--surface-bg)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-bg)'
                  }}
                >
                  <div
                    className="px-2 py-1 rounded text-xs font-mono font-bold"
                    style={{
                      background: 'var(--primary-50)',
                      color: 'var(--primary-700)',
                    }}
                  >
                    {mat.codigo}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] truncate flex-1">
                    {mat.descCurtoPt || '—'}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {mat.familia?.grupo?.disciplina?.nome}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
              Nenhum material cadastrado
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <Link
          href="/gerador"
          className="flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 card-hover"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            }}
          >
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Gerar Novo Código</p>
            <p className="text-xs text-[var(--text-muted)]">Cadastrar material com código automático</p>
          </div>
        </Link>
        <Link
          href="/consulta"
          className="flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 card-hover"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
            }}
          >
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Consultar Catálogo</p>
            <p className="text-xs text-[var(--text-muted)]">Buscar materiais por código ou descrição</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
