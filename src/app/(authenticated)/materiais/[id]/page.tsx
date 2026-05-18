'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3, Trash2, Globe, Package, Layers, GitBranch, Hash, Scale, Weight, Clock, User } from 'lucide-react'
import type { Material } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function DetalheMaterialPage() {
  const params = useParams()
  const router = useRouter()
  const { usuario } = useAuth()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'pt'|'en'|'es'>('pt')

  useEffect(() => {
    fetch(`/api/materiais/${params.id}`).then(r => r.json()).then(m => {
      setMaterial(m)
      setEditData({
        descCurtoPt: m.descCurtoPt || '', descLongoPt: m.descLongoPt || '',
        descCurtoEn: m.descCurtoEn || '', descLongoEn: m.descLongoEn || '',
        descCurtoEs: m.descCurtoEs || '', descLongoEs: m.descLongoEs || '',
        unidade: m.unidade || '', peso: m.peso ? String(m.peso) : '',
      })
    }).finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/materiais/${params.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editData, peso: editData.peso ? parseFloat(editData.peso) : null }),
      })
      const updated = await res.json()
      setMaterial(updated); setEditing(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Deseja inativar este material?')) return
    await fetch(`/api/materiais/${params.id}`, { method: 'DELETE' })
    router.push('/consulta')
  }

  if (loading) return <div className="p-8"><div className="skeleton h-8 w-64 mb-6" /><div className="skeleton h-64 rounded-xl" /></div>
  if (!material) return <div className="p-8 text-center text-[var(--text-muted)]">Material não encontrado</div>

  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none"
  const inputStyle = { borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }
  const labelCls = "block text-xs font-medium text-[var(--text-muted)] mb-1.5"

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/consulta" className="inline-flex items-center gap-1.5 text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar à consulta
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-in">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Material</p>
          <h1 className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--primary-700)' }}>{material.codigo}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{material.descCurtoPt || 'Sem descritivo'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${material.status === 'ATIVO' ? 'badge-success' : 'badge-error'}`}>{material.status}</span>
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)' }}>
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              {usuario?.perfil === 'ADMIN' && material.status === 'ATIVO' && (
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer" style={{ background: 'var(--error)' }}>
                  <Trash2 className="w-3 h-3" /> Inativar
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer" style={{ borderColor: 'var(--surface-border)' }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: 'var(--primary-600)' }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {[
          { icon: Layers, label: 'Disciplina', value: material.familia?.grupo?.disciplina?.nome },
          { icon: GitBranch, label: 'Grupo', value: `${material.familia?.grupo?.codigo} — ${material.familia?.grupo?.nome}` },
          { icon: Hash, label: 'Família', value: `${material.familia?.codigo} — ${material.familia?.nome}` },
          { icon: Scale, label: 'Unidade', value: editing ? undefined : (material.unidade || '—') },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-3.5 h-3.5 text-[var(--primary-500)]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</span>
            </div>
            {item.value !== undefined ? (
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.value}</p>
            ) : (
              <input value={editData.unidade} onChange={e => setEditData(d => ({...d, unidade: e.target.value}))} className={inputCls} style={inputStyle} />
            )}
          </div>
        ))}
      </div>

      {/* Descriptions */}
      <div className="rounded-xl border mb-8 animate-fade-in" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)', animationDelay: '0.15s' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <Globe className="w-4 h-4 text-[var(--primary-500)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Descritivos</h2>
          <div className="ml-auto flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--surface-bg)' }}>
            {(['pt','en','es'] as const).map(l => (
              <button key={l} onClick={() => setActiveTab(l)} className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
                style={{ background: activeTab === l ? 'var(--surface-card)' : 'transparent', color: activeTab === l ? 'var(--primary-600)' : 'var(--text-muted)', boxShadow: activeTab === l ? 'var(--shadow-sm)' : 'none' }}>
                {l === 'pt' ? '🇧🇷 PT' : l === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 space-y-4">
          {activeTab === 'pt' && (
            <>
              <div><label className={labelCls}>Descritivo Curto</label>
                {editing ? <input value={editData.descCurtoPt} onChange={e => setEditData(d => ({...d, descCurtoPt: e.target.value}))} className={inputCls} style={inputStyle} />
                : <p className="text-sm text-[var(--text-primary)]">{material.descCurtoPt || '—'}</p>}
              </div>
              <div><label className={labelCls}>Descritivo Longo</label>
                {editing ? <textarea value={editData.descLongoPt} onChange={e => setEditData(d => ({...d, descLongoPt: e.target.value}))} rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
                : <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{material.descLongoPt || '—'}</p>}
              </div>
            </>
          )}
          {activeTab === 'en' && (
            <>
              <div><label className={labelCls}>Short Description</label>
                {editing ? <input value={editData.descCurtoEn} onChange={e => setEditData(d => ({...d, descCurtoEn: e.target.value}))} className={inputCls} style={inputStyle} />
                : <p className="text-sm text-[var(--text-primary)]">{material.descCurtoEn || '—'}</p>}
              </div>
              <div><label className={labelCls}>Long Description</label>
                {editing ? <textarea value={editData.descLongoEn} onChange={e => setEditData(d => ({...d, descLongoEn: e.target.value}))} rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
                : <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{material.descLongoEn || '—'}</p>}
              </div>
            </>
          )}
          {activeTab === 'es' && (
            <>
              <div><label className={labelCls}>Descripción Corta</label>
                {editing ? <input value={editData.descCurtoEs} onChange={e => setEditData(d => ({...d, descCurtoEs: e.target.value}))} className={inputCls} style={inputStyle} />
                : <p className="text-sm text-[var(--text-primary)]">{material.descCurtoEs || '—'}</p>}
              </div>
              <div><label className={labelCls}>Descripción Larga</label>
                {editing ? <textarea value={editData.descLongoEs} onChange={e => setEditData(d => ({...d, descLongoEs: e.target.value}))} rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
                : <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{material.descLongoEs || '—'}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2 mb-1"><Weight className="w-3 h-3 text-[var(--text-muted)]" /><span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Peso (kg)</span></div>
          {editing ? <input type="number" step="0.0001" value={editData.peso} onChange={e => setEditData(d => ({...d, peso: e.target.value}))} className={inputCls} style={inputStyle} />
          : <p className="text-sm font-medium">{material.peso ? Number(material.peso).toFixed(4) : '—'}</p>}
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2 mb-1"><User className="w-3 h-3 text-[var(--text-muted)]" /><span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Criado por</span></div>
          <p className="text-sm font-medium">{material.createdBy || '—'}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2 mb-1"><Clock className="w-3 h-3 text-[var(--text-muted)]" /><span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Criado em</span></div>
          <p className="text-sm font-medium">{new Date(material.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}
