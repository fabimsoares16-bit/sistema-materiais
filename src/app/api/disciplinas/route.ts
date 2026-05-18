import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: {
        _count: { select: { grupos: true } },
        grupos: {
          orderBy: { codigo: 'asc' },
          include: {
            _count: { select: { familias: true } },
            familias: {
              orderBy: { codigo: 'asc' },
              include: {
                _count: { select: { materiais: true } },
              },
            },
          },
        },
      },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json(disciplinas)
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar disciplinas' },
      { status: 500 }
    )
  }
}
