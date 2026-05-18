import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — Busca livre no catálogo de materiais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const disciplinaId = searchParams.get('disciplinaId')
    const grupoId = searchParams.get('grupoId')
    const familiaId = searchParams.get('familiaId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      status: 'ATIVO',
    }

    // Filtros hierárquicos
    if (familiaId) {
      where.familiaId = parseInt(familiaId)
    } else if (grupoId) {
      where.familia = { grupoId: parseInt(grupoId) }
    } else if (disciplinaId) {
      where.familia = { grupo: { disciplinaId: parseInt(disciplinaId) } }
    }

    // Busca por texto
    if (q.trim()) {
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { descCurtoPt: { contains: q, mode: 'insensitive' } },
        { descLongoPt: { contains: q, mode: 'insensitive' } },
        { descCurtoEn: { contains: q, mode: 'insensitive' } },
        { descCurtoEs: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [materiais, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          familia: {
            include: { grupo: { include: { disciplina: true } } },
          },
        },
      }),
      prisma.material.count({ where }),
    ])

    return NextResponse.json({
      data: materiais,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar materiais' },
      { status: 500 }
    )
  }
}
