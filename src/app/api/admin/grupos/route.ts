import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGrupoSchema = z.object({
  disciplinaId: z.number().int().positive(),
  codigo: z.string().min(2).max(10),
  nome: z.string().min(2).max(100),
})

// POST — Cria novo grupo (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createGrupoSchema.parse(body)

    const grupo = await prisma.grupo.create({
      data: {
        disciplinaId: data.disciplinaId,
        codigo: data.codigo.toUpperCase(),
        nome: data.nome.toUpperCase(),
      },
      include: { disciplina: true },
    })

    return NextResponse.json(grupo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar grupo:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao criar grupo' },
      { status: 500 }
    )
  }
}
