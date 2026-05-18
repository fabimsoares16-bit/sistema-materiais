'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Package,
  Plus,
  Layers,
  GitBranch,
  Hash,
  X,
  Globe,
  Scale,
  Weight,
  Check,
} from 'lucide-react'
import type { Disciplina, Grupo, Familia, Material, PaginatedResponse } from '@/types'

export default function GeradorPage() {
  const { usuario } = useAuth()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedFamilia, setSelectedFamilia] = useState<Familia | null>(null)
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loadingMateriais, setLoadingMateriais] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({})
  const [expandedDisciplinas, setExpandedDisciplinas] = useState<Record<number, boolean>>({})

  // Form state
  const [formData, setFormData] = useState({
    descCurtoPt: '', descLongoPt: '',
    descCurtoEn: '', descLongoEn: '',
    descCurtoEs: '', descLongoEs: '',
    unidade: '', peso: '',
  })
  const [activeTab, setActiveTab] = useState<'pt' | 'en' | 'es'>('pt')
  const [saving, setSaving] = useState(false)
  const [lastCreated, setLastCreated] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Load disciplinas
  useEffect(() => {
    fetch('/api/disciplinas')
      .then((r) => r.json())
      .then((data) => {
        setDisciplinas(data)
        // Auto-expand first disciplina
        if (data.length > 0) {
          setExpandedDisciplinas({ [data[0].id]: true })
        }
      })
  }, [])

  // Load materials when family selected
  const loadMateriais = useCallback((familiaId: number) => {
    setLoadingMateriais(true)
    fetch(`/api/materiais?familiaId=${familiaId}&limit=100`)
      .then((r) => r.json())
      .then((data: PaginatedResponse<Material>) => setMateriais(data.data))
      .finally(() => setLoadingMateriais(false))
  }, [])

  useEffect(() => {
    if (selectedFamilia) {
      loadMateriais(selectedFamilia.id)
    }
  }, [selectedFamilia, loadMateriais])

  const handleSelectFamilia = (familia: Familia) => {
    setSelectedFamilia(familia)
    setShowForm(false)
    setLastCreated(null)
  }

  const resetForm = () => {
    setFormData({
      descCurtoPt: '', descLongoPt: '',
      descCurtoEn: '', descLongoEn: '',
      descCurtoEs: '', descLongoEs: '',
      unidade: '', peso: '',
    })
    setActiveTab('pt')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFamilia) return

    setSaving(true)
    try {
      const res = await fetch('/api/materiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familiaId: selectedFamilia.id,
          ...formData,
          peso: formData.peso ? parseFloat(formData.peso) : undefined,
          createdBy: usuario?.email,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar material')
      }

      const material = await res.json()
      setLastCreated(material.codigo)
      setToast({ message: `Código ${material.codigo} gerado com sucesso!`, type: 'success' })
      resetForm()
      setShowForm(false)
      loadMateriais(selectedFamilia.id)

      // Refresh disciplinas to update counts
      fetch('/api/disciplinas').then(r => r.json()).then(setDisciplinas)
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Erro', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Clear toast after 4s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  return (
    <div className="h-full flex">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-slide-right flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
          }}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Left Panel — Hierarchy Tree */}
      <div
        className="w-72 border-r flex flex-col shrink-0"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
        }}
      >
        <div
          className="px-4 py-3 border-b flex items-center gap-2"
          style={{
            background: 'var(--surface-bg)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <FolderTree className="w-4 h-4 text-[var(--primary-500)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Hierarquia de Materiais
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {disciplinas.map((disc) => (
            <div key={disc.id} className="mb-1">
              {/* Disciplina */}
              <button
                onClick={() => setExpandedDisciplinas((prev) => ({ ...prev, [disc.id]: !prev[disc.id] }))}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  color: 'var(--text-primary)',
                  background: expandedDisciplinas[disc.id] ? 'var(--primary-50)' : 'transparent',
                }}
              >
                {expandedDisciplinas[disc.id] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--primary-500)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                <Layers className="w-3.5 h-3.5 text-[var(--primary-500)]" />
                <span>{disc.nome}</span>
              </button>

              {/* Grupos */}
              {expandedDisciplinas[disc.id] && disc.grupos?.map((grupo: Grupo) => (
                <div key={grupo.id} className="ml-4">
                  <button
                    onClick={() => setExpandedGroups((prev) => ({ ...prev, [grupo.id]: !prev[grupo.id] }))}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {expandedGroups[grupo.id] ? (
                      <ChevronDown className="w-3 h-3 text-[var(--primary-400)]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                    )}
                    <GitBranch className="w-3 h-3" />
                    <span>{grupo.codigo} — {grupo.nome}</span>
                  </button>

                  {/* Famílias */}
                  {expandedGroups[grupo.id] && grupo.familias?.map((fam: Familia) => (
                    <button
                      key={fam.id}
                      onClick={() => handleSelectFamilia(fam)}
                      className="w-full flex items-center gap-2 ml-5 px-2 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer"
                      style={{
                        background: selectedFamilia?.id === fam.id ? 'var(--primary-100)' : 'transparent',
                        color: selectedFamilia?.id === fam.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                        fontWeight: selectedFamilia?.id === fam.id ? 600 : 400,
                      }}
                    >
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{fam.codigo}</span>
                      <span className="truncate">— {fam.nome}</span>
                      {fam._count && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: 'var(--surface-bg)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {fam._count.materiais}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center — Materials Table */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div
          className="px-5 py-3 border-b flex items-center justify-between shrink-0"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {selectedFamilia
                ? `${selectedFamilia.nome} (${selectedFamilia.codigo})`
                : 'Selecione uma família'}
            </h2>
            {selectedFamilia && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Prefixo: <span className="font-mono font-semibold">{selectedFamilia.codigo}</span> • Código auto-gerado
                {lastCreated && (
                  <span className="ml-2 text-[var(--success)] font-semibold">
                    ✓ Último: {lastCreated}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => { setShowForm(true); resetForm() }}
            disabled={!selectedFamilia}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: selectedFamilia
                ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'
                : 'var(--text-muted)',
              boxShadow: selectedFamilia ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Novo Material
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          {!selectedFamilia ? (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione uma disciplina, grupo e família</p>
                <p className="text-xs mt-1">para visualizar os materiais cadastrados</p>
              </div>
            </div>
          ) : loadingMateriais ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : materiais.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum material nesta família</p>
                <p className="text-xs mt-1">Clique em &quot;Novo Material&quot; para criar o primeiro</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Descritivo Curto (PT)</th>
                  <th className="px-4 py-3 font-semibold">Unidade</th>
                  <th className="px-4 py-3 font-semibold">Peso (kg)</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {materiais.map((mat) => (
                  <tr
                    key={mat.id}
                    className="border-t transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--surface-border)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/materiais/${mat.id}`}
                        className="font-mono font-bold text-[var(--primary-600)] hover:text-[var(--primary-700)] transition-colors"
                      >
                        {mat.codigo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] max-w-md truncate">
                      {mat.descCurtoPt || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{mat.unidade || '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {mat.peso ? Number(mat.peso).toFixed(3) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${mat.status === 'ATIVO' ? 'badge-success' : 'badge-error'}`}>
                        {mat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Panel — Form */}
      {showForm && selectedFamilia && (
        <div
          className="w-[460px] border-l flex flex-col shrink-0 animate-slide-right"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between shrink-0"
            style={{ background: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Novo Material
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Família: {selectedFamilia.codigo} • Código será gerado automaticamente
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Language tabs */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-bg)' }}>
              {(['pt', 'en', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={{
                    background: activeTab === lang ? 'var(--surface-card)' : 'transparent',
                    color: activeTab === lang ? 'var(--primary-600)' : 'var(--text-muted)',
                    boxShadow: activeTab === lang ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Globe className="w-3 h-3" />
                  {lang === 'pt' ? 'Português' : lang === 'en' ? 'English' : 'Español'}
                </button>
              ))}
            </div>

            {/* PT fields */}
            {activeTab === 'pt' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Descritivo Curto (PT)
                  </label>
                  <input
                    value={formData.descCurtoPt}
                    onChange={(e) => setFormData((f) => ({ ...f, descCurtoPt: e.target.value }))}
                    placeholder="Ex: CABO FLEX 0,6/1KV 3X2,5MM² PVC PRETO"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Descritivo Longo (PT)
                  </label>
                  <textarea
                    value={formData.descLongoPt}
                    onChange={(e) => setFormData((f) => ({ ...f, descLongoPt: e.target.value }))}
                    placeholder="Descrição completa do material em português..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
              </div>
            )}

            {/* EN fields */}
            {activeTab === 'en' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Short Description (EN)
                  </label>
                  <input
                    value={formData.descCurtoEn}
                    onChange={(e) => setFormData((f) => ({ ...f, descCurtoEn: e.target.value }))}
                    placeholder="Ex: FLEX CABLE 0.6/1KV 3X2.5MM² PVC BLACK"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Long Description (EN)
                  </label>
                  <textarea
                    value={formData.descLongoEn}
                    onChange={(e) => setFormData((f) => ({ ...f, descLongoEn: e.target.value }))}
                    placeholder="Full material description in English..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
              </div>
            )}

            {/* ES fields */}
            {activeTab === 'es' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Descripción Corta (ES)
                  </label>
                  <input
                    value={formData.descCurtoEs}
                    onChange={(e) => setFormData((f) => ({ ...f, descCurtoEs: e.target.value }))}
                    placeholder="Ej: CABLE FLEX 0,6/1KV 3X2,5MM² PVC NEGRO"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Descripción Larga (ES)
                  </label>
                  <textarea
                    value={formData.descLongoEs}
                    onChange={(e) => setFormData((f) => ({ ...f, descLongoEs: e.target.value }))}
                    placeholder="Descripción completa del material en español..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                  />
                </div>
              </div>
            )}

            {/* Technical attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <Scale className="w-3 h-3" /> Unidade
                </label>
                <input
                  value={formData.unidade}
                  onChange={(e) => setFormData((f) => ({ ...f, unidade: e.target.value }))}
                  placeholder="m, pç, kg..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                  style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <Weight className="w-3 h-3" /> Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.peso}
                  onChange={(e) => setFormData((f) => ({ ...f, peso: e.target.value }))}
                  placeholder="0.0000"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                  style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Incluir Código
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
