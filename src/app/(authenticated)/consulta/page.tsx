'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, Package, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Material, PaginatedResponse, Disciplina, Grupo, Familia } from '@/types'

export default function ConsultaPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Material[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selDisc, setSelDisc] = useState('')
  const [selGrupo, setSelGrupo] = useState('')
  const [selFam, setSelFam] = useState('')

  useEffect(() => { fetch('/api/disciplinas').then(r => r.json()).then(setDisciplinas) }, [])

  const doSearch = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (query.trim()) p.set('q', query.trim())
    if (selDisc) p.set('disciplinaId', selDisc)
    if (selGrupo) p.set('grupoId', selGrupo)
    if (selFam) p.set('familiaId', selFam)
    p.set('page', String(page)); p.set('limit', '20')
    try {
      const r = await fetch(`/api/materiais/buscar?${p.toString()}`)
      const d: PaginatedResponse<Material> = await r.json()
      setResults(d.data); setTotal(d.total); setTotalPages(d.totalPages)
    } finally { setLoading(false) }
  }, [query, selDisc, selGrupo, selFam, page])

  useEffect(() => { doSearch() }, [doSearch])
  useEffect(() => { const t = setTimeout(() => { setPage(1) }, 300); return () => clearTimeout(t) }, [query])

  const grupos: Grupo[] = selDisc ? disciplinas.find(d => d.id === parseInt(selDisc))?.grupos || [] : []
  const familias: Familia[] = selGrupo ? grupos.find(g => g.id === parseInt(selGrupo))?.familias || [] : []

  const inputStyle = { borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }

  return (
    <div className="p-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Consulta / Busca</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Pesquise materiais por código, descritivo ou filtros</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por código ou descritivo..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
            style={{ ...inputStyle, background: 'var(--surface-card)', boxShadow: 'var(--shadow-sm)' }}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer"
          style={{ background: showFilters ? 'var(--primary-50)' : 'var(--surface-card)', borderColor: showFilters ? 'var(--primary-300)' : 'var(--surface-border)', color: showFilters ? 'var(--primary-600)' : 'var(--text-secondary)' }}
        ><Filter className="w-4 h-4" /> Filtros</button>
      </div>

      {showFilters && (
        <div className="p-5 rounded-xl border mb-6 animate-fade-in" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Filtros</p>
            {(selDisc || selGrupo || selFam) && (
              <button onClick={() => { setSelDisc(''); setSelGrupo(''); setSelFam('') }} className="flex items-center gap-1 text-xs text-[var(--error)] cursor-pointer"><X className="w-3 h-3" /> Limpar</button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Disciplina</label>
              <select value={selDisc} onChange={e => { setSelDisc(e.target.value); setSelGrupo(''); setSelFam(''); setPage(1) }} className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer" style={inputStyle}>
                <option value="">Todas</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Grupo</label>
              <select value={selGrupo} onChange={e => { setSelGrupo(e.target.value); setSelFam(''); setPage(1) }} disabled={!selDisc} className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-40 cursor-pointer" style={inputStyle}>
                <option value="">Todos</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.codigo} — {g.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Família</label>
              <select value={selFam} onChange={e => { setSelFam(e.target.value); setPage(1) }} disabled={!selGrupo} className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-40 cursor-pointer" style={inputStyle}>
                <option value="">Todas</option>
                {familias.map(f => <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] mb-4">{loading ? 'Buscando...' : `${total} resultado${total !== 1 ? 's' : ''}`}</p>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Nenhum material encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}>
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 font-semibold">Descritivo Curto</th>
                <th className="px-5 py-3 font-semibold">Família</th>
                <th className="px-5 py-3 font-semibold">Unidade</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(mat => (
                <tr key={mat.id} className="border-t transition-colors" style={{ borderColor: 'var(--surface-border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <td className="px-5 py-3"><Link href={`/materiais/${mat.id}`} className="font-mono font-bold text-[var(--primary-600)] hover:text-[var(--primary-700)]">{mat.codigo}</Link></td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] max-w-xs truncate">{mat.descCurtoPt || '—'}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{mat.familia?.codigo}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{mat.unidade || '—'}</td>
                  <td className="px-5 py-3"><span className={`badge ${mat.status === 'ATIVO' ? 'badge-success' : 'badge-error'}`}>{mat.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium disabled:opacity-40 cursor-pointer" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)' }}>
            <ChevronLeft className="w-3 h-3" /> Anterior
          </button>
          <span className="text-xs text-[var(--text-muted)]">Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium disabled:opacity-40 cursor-pointer" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)' }}>
            Próxima <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
