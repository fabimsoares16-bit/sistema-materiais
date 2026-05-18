// ============================================
// Tipos TypeScript do sistema
// ============================================

export interface Disciplina {
  id: number
  codigo: string
  nome: string
  createdAt: string
  grupos?: Grupo[]
  _count?: { grupos: number }
}

export interface Grupo {
  id: number
  disciplinaId: number
  codigo: string
  nome: string
  createdAt: string
  disciplina?: Disciplina
  familias?: Familia[]
  _count?: { familias: number }
}

export interface Familia {
  id: number
  grupoId: number
  codigo: string
  nome: string
  proximoSequencial: number
  createdAt: string
  grupo?: Grupo & { disciplina?: Disciplina }
  _count?: { materiais: number }
}

export interface Material {
  id: number
  familiaId: number
  codigo: string
  descCurtoPt: string | null
  descLongoPt: string | null
  descCurtoEn: string | null
  descLongoEn: string | null
  descCurtoEs: string | null
  descLongoEs: string | null
  unidade: string | null
  peso: number | null
  status: string
  createdBy: string | null
  createdAt: string
  updatedAt: string
  familia?: Familia & {
    grupo: Grupo & {
      disciplina: Disciplina
    }
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  totalMateriais: number
  totalDisciplinas: number
  totalFamilias: number
  totalGrupos: number
  recentes: Material[]
  porDisciplina: { nome: string; total: number }[]
}

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: 'ADMIN' | 'PROJETISTA'
}
