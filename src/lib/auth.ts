// Autenticação simplificada — credenciais fixas para demonstração acadêmica

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: 'ADMIN' | 'PROJETISTA'
}

const USUARIOS: { email: string; senha: string; usuario: Usuario }[] = [
  {
    email: 'admin@sistema.com',
    senha: 'admin123',
    usuario: {
      id: 1,
      nome: 'Administrador',
      email: 'admin@sistema.com',
      perfil: 'ADMIN',
    },
  },
  {
    email: 'projetista@sistema.com',
    senha: 'proj123',
    usuario: {
      id: 2,
      nome: 'Projetista',
      email: 'projetista@sistema.com',
      perfil: 'PROJETISTA',
    },
  },
]

export function authenticate(
  email: string,
  senha: string
): Usuario | null {
  const found = USUARIOS.find(
    (u) => u.email === email && u.senha === senha
  )
  return found ? found.usuario : null
}

export function isAdmin(usuario: Usuario): boolean {
  return usuario.perfil === 'ADMIN'
}
