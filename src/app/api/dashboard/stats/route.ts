import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — Estatísticas para o dashboard
export async function GET() {
  try {
    const [
      totalMateriais,
      totalDisciplinas,
      totalGrupos,
      totalFamilias,
      recentes,
      disciplinas,
    ] = await Promise.all([
      prisma.material.count({ where: { status: 'ATIVO' } }),
      prisma.disciplina.count(),
      prisma.grupo.count(),
      prisma.familia.count(),
      prisma.material.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          familia: {
            include: { grupo: { include: { disciplina: true } } },
          },
        },
      }),
      prisma.disciplina.findMany({
        include: {
          grupos: {
            include: {
              familias: {
                include: {
                  _count: { select: { materiais: true } },
                },
              },
            },
          },
        },
      }),
    ])

    // Calcula materiais por disciplina
    const porDisciplina = disciplinas.map((d) => ({
      nome: d.nome,
      total: d.grupos.reduce(
        (acc, g) =>
          acc + g.familias.reduce((fAcc, f) => fAcc + f._count.materiais, 0),
        0
      ),
    }))

    return NextResponse.json({
      totalMateriais,
      totalDisciplinas,
      totalGrupos,
      totalFamilias,
      recentes,
      porDisciplina,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
