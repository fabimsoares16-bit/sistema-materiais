import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupoId')

    const where = grupoId ? { grupoId: parseInt(grupoId) } : {}

    const familias = await prisma.familia.findMany({
      where,
      include: {
        grupo: { include: { disciplina: true } },
        _count: { select: { materiais: true } },
      },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json(familias)
  } catch (error) {
    console.error('Erro ao listar famílias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar famílias' },
      { status: 500 }
    )
  }
}
