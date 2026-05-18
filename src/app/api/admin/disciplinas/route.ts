import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createDisciplinaSchema = z.object({
  codigo: z.string().min(2).max(10),
  nome: z.string().min(2).max(100),
})

// POST — Cria nova disciplina (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createDisciplinaSchema.parse(body)

    const disciplina = await prisma.disciplina.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        nome: data.nome.toUpperCase(),
      },
    })

    return NextResponse.json(disciplina, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disciplina:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao criar disciplina' },
      { status: 500 }
    )
  }
}
