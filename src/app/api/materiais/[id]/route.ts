import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — Detalhes de um material
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
      include: {
        familia: {
          include: { grupo: { include: { disciplina: true } } },
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('Erro ao buscar material:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar material' },
      { status: 500 }
    )
  }
}

// PUT — Edita material existente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: {
        descCurtoPt: body.descCurtoPt,
        descLongoPt: body.descLongoPt,
        descCurtoEn: body.descCurtoEn,
        descLongoEn: body.descLongoEn,
        descCurtoEs: body.descCurtoEs,
        descLongoEs: body.descLongoEs,
        unidade: body.unidade,
        peso: body.peso,
      },
      include: {
        familia: {
          include: { grupo: { include: { disciplina: true } } },
        },
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('Erro ao editar material:', error)
    return NextResponse.json(
      { error: 'Erro ao editar material' },
      { status: 500 }
    )
  }
}

// DELETE — Inativa material (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.material.update({
      where: { id: parseInt(id) },
      data: { status: 'INATIVO' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao inativar material:', error)
    return NextResponse.json(
      { error: 'Erro ao inativar material' },
      { status: 500 }
    )
  }
}
