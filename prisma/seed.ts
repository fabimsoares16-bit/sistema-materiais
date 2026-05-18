import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // Verifica se já existe dados
  const count = await prisma.disciplina.count()
  if (count > 0) {
    console.log('⏩ Dados já existem, pulando seed.')
    return
  }

  // =============================================
  // 1. DISCIPLINA: ELÉTRICA
  // =============================================
  const eletrica = await prisma.disciplina.create({
    data: { codigo: 'ELE', nome: 'ELÉTRICA' },
  })

  console.log('✅ Disciplina ELÉTRICA criada')

  // =============================================
  // 2. GRUPOS (8 conforme proposta)
  // =============================================
  const grupos = await Promise.all([
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'CB', nome: 'CABO' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'EC', nome: 'ELETROCALHA' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'ED', nome: 'ELETRODUTO' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'CN', nome: 'CONECTOR / TERMINAL' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'DJ', nome: 'DISJUNTOR' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'QD', nome: 'QUADRO ELÉTRICO' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'LU', nome: 'LUMINÁRIA' } }),
    prisma.grupo.create({ data: { disciplinaId: eletrica.id, codigo: 'AT', nome: 'ATERRAMENTO' } }),
  ])

  const [cb, ec, ed, cn, dj, qd, lu, at] = grupos
  console.log('✅ 8 grupos criados')

  // =============================================
  // 3. FAMÍLIAS (22 conforme proposta)
  // =============================================

  // CB — CABO (4 famílias)
  const cbco = await prisma.familia.create({ data: { grupoId: cb.id, codigo: 'CBCO', nome: 'Cabo de Cobre' } })
  const cbal = await prisma.familia.create({ data: { grupoId: cb.id, codigo: 'CBAL', nome: 'Cabo de Alumínio' } })
  await prisma.familia.create({ data: { grupoId: cb.id, codigo: 'CBFO', nome: 'Cabo de Fibra Óptica' } })
  await prisma.familia.create({ data: { grupoId: cb.id, codigo: 'CBCX', nome: 'Cabo Coaxial' } })

  // EC — ELETROCALHA (3 famílias)
  const ecpf = await prisma.familia.create({ data: { grupoId: ec.id, codigo: 'ECPF', nome: 'Eletrocalha Perfurada' } })
  await prisma.familia.create({ data: { grupoId: ec.id, codigo: 'ECLS', nome: 'Eletrocalha Lisa' } })
  await prisma.familia.create({ data: { grupoId: ec.id, codigo: 'ECAR', nome: 'Eletrocalha Aramada' } })

  // ED — ELETRODUTO (3 famílias)
  const edpv = await prisma.familia.create({ data: { grupoId: ed.id, codigo: 'EDPV', nome: 'Eletroduto PVC' } })
  await prisma.familia.create({ data: { grupoId: ed.id, codigo: 'EDGA', nome: 'Eletroduto Galvanizado' } })
  await prisma.familia.create({ data: { grupoId: ed.id, codigo: 'EDFL', nome: 'Eletroduto Flexível' } })

  // CN — CONECTOR / TERMINAL (3 famílias)
  await prisma.familia.create({ data: { grupoId: cn.id, codigo: 'CNTL', nome: 'Terminal Tubular' } })
  await prisma.familia.create({ data: { grupoId: cn.id, codigo: 'CNTC', nome: 'Terminal Compressão' } })
  await prisma.familia.create({ data: { grupoId: cn.id, codigo: 'CNEM', nome: 'Emenda' } })

  // DJ — DISJUNTOR (3 famílias)
  const djmn = await prisma.familia.create({ data: { grupoId: dj.id, codigo: 'DJMN', nome: 'Disjuntor Monopolar' } })
  await prisma.familia.create({ data: { grupoId: dj.id, codigo: 'DJBP', nome: 'Disjuntor Bipolar' } })
  await prisma.familia.create({ data: { grupoId: dj.id, codigo: 'DJTP', nome: 'Disjuntor Tripolar' } })

  // QD — QUADRO ELÉTRICO (2 famílias)
  await prisma.familia.create({ data: { grupoId: qd.id, codigo: 'QDEM', nome: 'Quadro de Embutir' } })
  await prisma.familia.create({ data: { grupoId: qd.id, codigo: 'QDSB', nome: 'Quadro de Sobrepor' } })

  // LU — LUMINÁRIA (3 famílias)
  await prisma.familia.create({ data: { grupoId: lu.id, codigo: 'LULD', nome: 'Luminária LED' } })
  await prisma.familia.create({ data: { grupoId: lu.id, codigo: 'LUFL', nome: 'Luminária Fluorescente' } })
  await prisma.familia.create({ data: { grupoId: lu.id, codigo: 'LUEM', nome: 'Luminária Emergência' } })

  // AT — ATERRAMENTO (2 famílias)
  await prisma.familia.create({ data: { grupoId: at.id, codigo: 'ATHA', nome: 'Haste de Aterramento' } })
  await prisma.familia.create({ data: { grupoId: at.id, codigo: 'ATCB', nome: 'Cabo de Aterramento' } })

  console.log('✅ 22 famílias criadas')

  // =============================================
  // 4. MATERIAIS DE EXEMPLO
  // =============================================

  // Cabos de Cobre
  await prisma.material.create({
    data: {
      familiaId: cbco.id,
      codigo: 'CBCO00001',
      descCurtoPt: 'CABO FLEX 0,6/1KV 3X2,5MM² PVC PRETO',
      descLongoPt: 'CABO FLEXÍVEL 0,6/1KV 3X2,5MM² ISOLAÇÃO PVC COR PRETA, CONDUTORES COBRE ESTANHADO, PARA INSTALAÇÃO EM ELETRODUTOS E ELETROCALHAS',
      descCurtoEn: 'FLEX CABLE 0.6/1KV 3X2.5MM² PVC BLACK',
      descLongoEn: 'FLEXIBLE CABLE 0.6/1KV 3X2.5MM² PVC BLACK INSULATION, TINNED COPPER CONDUCTORS, FOR CONDUIT AND CABLE TRAY INSTALLATION',
      descCurtoEs: 'CABLE FLEX 0,6/1KV 3X2,5MM² PVC NEGRO',
      descLongoEs: 'CABLE FLEXIBLE 0,6/1KV 3X2,5MM² AISLAMIENTO PVC COLOR NEGRO, CONDUCTORES COBRE ESTAÑADO',
      unidade: 'm',
      peso: 0.089,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.material.create({
    data: {
      familiaId: cbco.id,
      codigo: 'CBCO00002',
      descCurtoPt: 'CABO FLEX 0,6/1KV 3X4MM² PVC PRETO',
      descLongoPt: 'CABO FLEXÍVEL 0,6/1KV 3X4MM² ISOLAÇÃO PVC COR PRETA, CONDUTORES COBRE ESTANHADO',
      descCurtoEn: 'FLEX CABLE 0.6/1KV 3X4MM² PVC BLACK',
      descLongoEn: 'FLEXIBLE CABLE 0.6/1KV 3X4MM² PVC BLACK INSULATION, TINNED COPPER CONDUCTORS',
      descCurtoEs: 'CABLE FLEX 0,6/1KV 3X4MM² PVC NEGRO',
      descLongoEs: 'CABLE FLEXIBLE 0,6/1KV 3X4MM² AISLAMIENTO PVC COLOR NEGRO, CONDUCTORES COBRE ESTAÑADO',
      unidade: 'm',
      peso: 0.135,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.material.create({
    data: {
      familiaId: cbco.id,
      codigo: 'CBCO00003',
      descCurtoPt: 'CABO FLEX 0,6/1KV 4X10MM² PVC PRETO',
      descLongoPt: 'CABO FLEXÍVEL 0,6/1KV 4X10MM² ISOLAÇÃO PVC COR PRETA, CONDUTORES COBRE ESTANHADO, PARA ALIMENTAÇÃO DE QUADROS',
      descCurtoEn: 'FLEX CABLE 0.6/1KV 4X10MM² PVC BLACK',
      descLongoEn: 'FLEXIBLE CABLE 0.6/1KV 4X10MM² PVC BLACK INSULATION, TINNED COPPER CONDUCTORS, FOR PANEL FEEDING',
      descCurtoEs: 'CABLE FLEX 0,6/1KV 4X10MM² PVC NEGRO',
      descLongoEs: 'CABLE FLEXIBLE 0,6/1KV 4X10MM² AISLAMIENTO PVC COLOR NEGRO, PARA ALIMENTACIÓN DE CUADROS',
      unidade: 'm',
      peso: 0.520,
      createdBy: 'admin@sistema.com',
    },
  })

  // Atualiza sequencial de CBCO
  await prisma.familia.update({
    where: { id: cbco.id },
    data: { proximoSequencial: 4 },
  })

  // Cabo de Alumínio
  await prisma.material.create({
    data: {
      familiaId: cbal.id,
      codigo: 'CBAL00001',
      descCurtoPt: 'CABO ALUMÍNIO XLPE 1X240MM² 15KV',
      descLongoPt: 'CABO DE ALUMÍNIO ISOLAÇÃO XLPE 1X240MM² TENSÃO 15KV, PARA DISTRIBUIÇÃO SUBTERRÂNEA',
      descCurtoEn: 'ALUMINUM CABLE XLPE 1X240MM² 15KV',
      descLongoEn: 'ALUMINUM CABLE XLPE INSULATION 1X240MM² 15KV, FOR UNDERGROUND DISTRIBUTION',
      descCurtoEs: 'CABLE ALUMINIO XLPE 1X240MM² 15KV',
      descLongoEs: 'CABLE DE ALUMINIO AISLAMIENTO XLPE 1X240MM² TENSIÓN 15KV, PARA DISTRIBUCIÓN SUBTERRÁNEA',
      unidade: 'm',
      peso: 1.250,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.familia.update({
    where: { id: cbal.id },
    data: { proximoSequencial: 2 },
  })

  // Eletrocalha Perfurada
  await prisma.material.create({
    data: {
      familiaId: ecpf.id,
      codigo: 'ECPF00001',
      descCurtoPt: 'ELETROCALHA PERFURADA AÇO GALV 100X50MM 3M',
      descLongoPt: 'ELETROCALHA PERFURADA AÇO GALVANIZADO A FOGO 100MM LARGURA X 50MM ALTURA, COMPRIMENTO 3 METROS, COM TAMPA',
      descCurtoEn: 'PERFORATED CABLE TRAY GALV STEEL 100X50MM 3M',
      descLongoEn: 'PERFORATED CABLE TRAY HOT-DIP GALVANIZED STEEL 100MM W X 50MM H, LENGTH 3 METERS, WITH COVER',
      descCurtoEs: 'BANDEJA PERFORADA ACERO GALV 100X50MM 3M',
      descLongoEs: 'BANDEJA PERFORADA ACERO GALVANIZADO EN CALIENTE 100MM ANCHO X 50MM ALTO, LONGITUD 3 METROS, CON TAPA',
      unidade: 'pç',
      peso: 4.500,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.familia.update({
    where: { id: ecpf.id },
    data: { proximoSequencial: 2 },
  })

  // Eletroduto PVC
  await prisma.material.create({
    data: {
      familiaId: edpv.id,
      codigo: 'EDPV00001',
      descCurtoPt: 'ELETRODUTO PVC RÍGIDO 25MM CINZA 3M',
      descLongoPt: 'ELETRODUTO RÍGIDO PVC SÉRIE RU 25MM DE DIÂMETRO EXTERNO, COR CINZA, COMPRIMENTO 3 METROS',
      descCurtoEn: 'PVC RIGID CONDUIT 25MM GRAY 3M',
      descLongoEn: 'PVC RIGID CONDUIT RU SERIES 25MM OUTER DIAMETER, GRAY COLOR, LENGTH 3 METERS',
      descCurtoEs: 'TUBO PVC RÍGIDO 25MM GRIS 3M',
      descLongoEs: 'TUBO RÍGIDO PVC SERIE RU 25MM DIÁMETRO EXTERIOR, COLOR GRIS, LONGITUD 3 METROS',
      unidade: 'pç',
      peso: 0.420,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.familia.update({
    where: { id: edpv.id },
    data: { proximoSequencial: 2 },
  })

  // Disjuntor Monopolar
  await prisma.material.create({
    data: {
      familiaId: djmn.id,
      codigo: 'DJMN00001',
      descCurtoPt: 'DISJUNTOR MONOPOLAR 16A CURVA C DIN',
      descLongoPt: 'DISJUNTOR TERMOMAGNÉTICO MONOPOLAR 16A CURVA C, CAPACIDADE DE INTERRUPÇÃO 6KA, MONTAGEM DIN',
      descCurtoEn: 'SINGLE POLE MCB 16A CURVE C DIN',
      descLongoEn: 'THERMOMAGNETIC MINIATURE CIRCUIT BREAKER SINGLE POLE 16A CURVE C, 6KA BREAKING CAPACITY, DIN MOUNT',
      descCurtoEs: 'INTERRUPTOR MONOPOLAR 16A CURVA C DIN',
      descLongoEs: 'INTERRUPTOR TERMOMAGNÉTICO MONOPOLAR 16A CURVA C, CAPACIDAD DE INTERRUPCIÓN 6KA, MONTAJE DIN',
      unidade: 'pç',
      peso: 0.120,
      createdBy: 'admin@sistema.com',
    },
  })

  await prisma.familia.update({
    where: { id: djmn.id },
    data: { proximoSequencial: 2 },
  })

  console.log('✅ 7 materiais de exemplo criados')
  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
