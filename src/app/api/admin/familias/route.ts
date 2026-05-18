import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createFamiliaSchema = z.object({
  grupoId: z.number().int().positive(),
  codigo: z.string().min(4).max(4),
  nome: z.string().min(2).max(100),
})

// POST — Cria nova família (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createFamiliaSchema.parse(body)

    const familia = await prisma.familia.create({
      data: {
        grupoId: data.grupoId,
        codigo: data.codigo.toUpperCase(),
        nome: data.nome,
      },
      include: {
        grupo: { include: { disciplina: true } },
      },
    })

    return NextResponse.json(familia, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar família:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao criar família' },
      { status: 500 }
    )
  }
}
