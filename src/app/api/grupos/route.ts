import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const disciplinaId = searchParams.get('disciplinaId')

    const where = disciplinaId
      ? { disciplinaId: parseInt(disciplinaId) }
      : {}

    const grupos = await prisma.grupo.findMany({
      where,
      include: {
        disciplina: true,
        _count: { select: { familias: true } },
        familias: {
          orderBy: { codigo: 'asc' },
          include: {
            _count: { select: { materiais: true } },
          },
        },
      },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json(grupos)
  } catch (error) {
    console.error('Erro ao listar grupos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar grupos' },
      { status: 500 }
    )
  }
}
