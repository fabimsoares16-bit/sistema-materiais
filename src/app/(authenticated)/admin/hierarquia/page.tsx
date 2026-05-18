'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Settings, Plus, Layers, GitBranch, Hash, X, Check } from 'lucide-react'
import type { Disciplina, Grupo, Familia } from '@/types'

type Tab = 'disciplinas' | 'grupos' | 'familias'

export default function HierarquiaPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('disciplinas')
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { if (!isAdmin) router.replace('/dashboard') }, [isAdmin, router])

  const loadData = () => { fetch('/api/disciplinas').then(r => r.json()).then(setDisciplinas) }
  useEffect(() => { loadData() }, [])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const allGrupos: (Grupo & { disciplina?: Disciplina })[] = disciplinas.flatMap(d => (d.grupos || []).map(g => ({ ...g, disciplina: d })))
  const allFamilias: (Familia & { grupo?: Grupo & { disciplina?: Disciplina } })[] = allGrupos.flatMap(g => (g.familias || []).map(f => ({ ...f, grupo: g })))

  const openCreate = () => {
    if (tab === 'disciplinas') setForm({ codigo: '', nome: '' })
    else if (tab === 'grupos') setForm({ disciplinaId: '', codigo: '', nome: '' })
    else setForm({ grupoId: '', codigo: '', nome: '' })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const endpoint = `/api/admin/${tab === 'disciplinas' ? 'disciplinas' : tab === 'grupos' ? 'grupos' : 'familias'}`
      const body: Record<string, unknown> = { codigo: form.codigo, nome: form.nome }
      if (tab === 'grupos') body.disciplinaId = parseInt(form.disciplinaId)
      if (tab === 'familias') body.grupoId = parseInt(form.grupoId)
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setShowModal(false); loadData()
      setToast(`${tab === 'disciplinas' ? 'Disciplina' : tab === 'grupos' ? 'Grupo' : 'Família'} criado(a)!`)
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro') }
    finally { setSaving(false) }
  }

  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none"
  const inputStyle = { borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }
  const tabs: { key: Tab; label: string; icon: typeof Layers }[] = [
    { key: 'disciplinas', label: 'Disciplinas', icon: Layers },
    { key: 'grupos', label: 'Grupos', icon: GitBranch },
    { key: 'familias', label: 'Famílias', icon: Hash },
  ]

  if (!isAdmin) return null

  return (
    <div className="p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-slide-right flex items-center gap-2" style={{ background: 'var(--success)' }}>
          <Check className="w-4 h-4" />{toast}
        </div>
      )}

      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Settings className="w-6 h-6 text-[var(--accent-500)]" /> Gestão da Hierarquia</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Área administrativa — CRUD de disciplinas, grupos e famílias</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
              style={{ background: tab === t.key ? 'var(--primary-600)' : 'transparent', color: tab === t.key ? 'white' : 'var(--text-secondary)' }}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        {tab === 'disciplinas' && (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}>
              <th className="px-5 py-3 font-semibold">Código</th><th className="px-5 py-3 font-semibold">Nome</th><th className="px-5 py-3 font-semibold">Grupos</th>
            </tr></thead>
            <tbody>{disciplinas.map(d => (
              <tr key={d.id} className="border-t" style={{ borderColor: 'var(--surface-border)' }}>
                <td className="px-5 py-3 font-mono font-bold text-[var(--primary-600)]">{d.codigo}</td>
                <td className="px-5 py-3">{d.nome}</td>
                <td className="px-5 py-3 text-[var(--text-muted)]">{d._count?.grupos ?? d.grupos?.length ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === 'grupos' && (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}>
              <th className="px-5 py-3 font-semibold">Código</th><th className="px-5 py-3 font-semibold">Nome</th><th className="px-5 py-3 font-semibold">Disciplina</th><th className="px-5 py-3 font-semibold">Famílias</th>
            </tr></thead>
            <tbody>{allGrupos.map(g => (
              <tr key={g.id} className="border-t" style={{ borderColor: 'var(--surface-border)' }}>
                <td className="px-5 py-3 font-mono font-bold text-[var(--primary-600)]">{g.codigo}</td>
                <td className="px-5 py-3">{g.nome}</td>
                <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{g.disciplina?.nome}</td>
                <td className="px-5 py-3 text-[var(--text-muted)]">{g._count?.familias ?? g.familias?.length ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === 'familias' && (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}>
              <th className="px-5 py-3 font-semibold">Código</th><th className="px-5 py-3 font-semibold">Nome</th><th className="px-5 py-3 font-semibold">Grupo</th><th className="px-5 py-3 font-semibold">Próx. Seq.</th><th className="px-5 py-3 font-semibold">Materiais</th>
            </tr></thead>
            <tbody>{allFamilias.map(f => (
              <tr key={f.id} className="border-t" style={{ borderColor: 'var(--surface-border)' }}>
                <td className="px-5 py-3 font-mono font-bold text-[var(--primary-600)]">{f.codigo}</td>
                <td className="px-5 py-3">{f.nome}</td>
                <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{f.grupo?.codigo} — {f.grupo?.nome}</td>
                <td className="px-5 py-3 font-mono text-[var(--text-muted)]">{f.proximoSequencial}</td>
                <td className="px-5 py-3 text-[var(--text-muted)]">{f._count?.materiais ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--surface-card)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Adicionar {tab === 'disciplinas' ? 'Disciplina' : tab === 'grupos' ? 'Grupo' : 'Família'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--surface-hover)] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {tab === 'grupos' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Disciplina</label>
                  <select value={form.disciplinaId} onChange={e => setForm(f => ({...f, disciplinaId: e.target.value}))} className={inputCls + ' cursor-pointer'} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
              )}
              {tab === 'familias' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Grupo</label>
                  <select value={form.grupoId} onChange={e => setForm(f => ({...f, grupoId: e.target.value}))} className={inputCls + ' cursor-pointer'} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {allGrupos.map(g => <option key={g.id} value={g.id}>{g.disciplina?.nome} → {g.codigo} — {g.nome}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Código {tab === 'familias' && '(4 letras)'}
                </label>
                <input value={form.codigo} onChange={e => setForm(f => ({...f, codigo: e.target.value.toUpperCase()}))}
                  maxLength={tab === 'familias' ? 4 : 10} placeholder={tab === 'familias' ? 'XXXX' : 'XX'}
                  className={inputCls + ' font-mono uppercase'} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Nome</label>
                <input value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} placeholder="Nome completo" className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer" style={{ borderColor: 'var(--surface-border)' }}>Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.codigo || !form.nome} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 cursor-pointer" style={{ background: 'var(--primary-600)' }}>
                {saving ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
