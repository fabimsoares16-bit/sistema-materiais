import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de material
const createMaterialSchema = z.object({
  familiaId: z.number().int().positive(),
  descCurtoPt: z.string().max(255).optional(),
  descLongoPt: z.string().optional(),
  descCurtoEn: z.string().max(255).optional(),
  descLongoEn: z.string().optional(),
  descCurtoEs: z.string().max(255).optional(),
  descLongoEs: z.string().optional(),
  unidade: z.string().max(10).optional(),
  peso: z.number().positive().optional(),
  createdBy: z.string().optional(),
})

// GET — Lista materiais com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const familiaId = searchParams.get('familiaId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (familiaId) where.familiaId = parseInt(familiaId)
    if (status) where.status = status

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
    console.error('Erro ao listar materiais:', error)
    return NextResponse.json(
      { error: 'Erro ao listar materiais' },
      { status: 500 }
    )
  }
}

// POST — Cria novo material com geração automática de código
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createMaterialSchema.parse(body)

    // Geração de código dentro de transação (evita duplicidade)
    const material = await prisma.$transaction(async (tx) => {
      // 1. Busca a família e seu próximo sequencial
      const familia = await tx.familia.findUnique({
        where: { id: data.familiaId },
      })

      if (!familia) {
        throw new Error('Família não encontrada')
      }

      // 2. Monta o código: [código família 4 letras] + [5 dígitos]
      const sequencial = String(familia.proximoSequencial).padStart(5, '0')
      const codigo = `${familia.codigo}${sequencial}`

      // 3. Incrementa o próximo sequencial
      await tx.familia.update({
        where: { id: familia.id },
        data: { proximoSequencial: familia.proximoSequencial + 1 },
      })

      // 4. Cria o material
      return tx.material.create({
        data: {
          familiaId: data.familiaId,
          codigo,
          descCurtoPt: data.descCurtoPt || null,
          descLongoPt: data.descLongoPt || null,
          descCurtoEn: data.descCurtoEn || null,
          descLongoEn: data.descLongoEn || null,
          descCurtoEs: data.descCurtoEs || null,
          descLongoEs: data.descLongoEs || null,
          unidade: data.unidade || null,
          peso: data.peso || null,
          createdBy: data.createdBy || null,
        },
        include: {
          familia: {
            include: { grupo: { include: { disciplina: true } } },
          },
        },
      })
    }, {
      isolationLevel: 'Serializable',
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar material:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar material'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
