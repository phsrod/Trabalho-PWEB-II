import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { horariosBloqueados } from '../db/schema/index.ts'

interface CriarHorarioBloqueadoInput {
  nomeBarbeiro: string
  data: string // formato: YYYY-MM-DD
  horario: string // formato: HH:MM
  motivo?: string
}

export class HorariosBloqueadosService {
  async listarTodos() {
    return await db
      .select({
        id: horariosBloqueados.id,
        nomeBarbeiro: horariosBloqueados.nomeBarbeiro,
        data: horariosBloqueados.data,
        horario: horariosBloqueados.horario,
        motivo: horariosBloqueados.motivo,
        criadoEm: horariosBloqueados.criadoEm,
      })
      .from(horariosBloqueados)
      .orderBy(horariosBloqueados.data, horariosBloqueados.horario)
  }

  async listarPorData(data: string) {
    return await db
      .select({
        id: horariosBloqueados.id,
        nomeBarbeiro: horariosBloqueados.nomeBarbeiro,
        data: horariosBloqueados.data,
        horario: horariosBloqueados.horario,
        motivo: horariosBloqueados.motivo,
      })
      .from(horariosBloqueados)
      .where(eq(horariosBloqueados.data, data))
      .orderBy(horariosBloqueados.horario)
  }

  async listarPorBarbeiroEData(nomeBarbeiro: string, data: string) {
    return await db
      .select({
        id: horariosBloqueados.id,
        nomeBarbeiro: horariosBloqueados.nomeBarbeiro,
        data: horariosBloqueados.data,
        horario: horariosBloqueados.horario,
        motivo: horariosBloqueados.motivo,
      })
      .from(horariosBloqueados)
      .where(
        and(
          eq(horariosBloqueados.nomeBarbeiro, nomeBarbeiro),
          eq(horariosBloqueados.data, data),
        ),
      )
      .orderBy(horariosBloqueados.horario)
  }

  async buscarPorId(id: string) {
    const [horario] = await db
      .select()
      .from(horariosBloqueados)
      .where(eq(horariosBloqueados.id, id))
      .limit(1)

    if (!horario) {
      throw new Error('Horário bloqueado não encontrado')
    }

    return horario
  }

  async criar(dados: CriarHorarioBloqueadoInput) {
    const [existente] = await db
      .select()
      .from(horariosBloqueados)
      .where(
        and(
          eq(horariosBloqueados.nomeBarbeiro, dados.nomeBarbeiro),
          eq(horariosBloqueados.data, dados.data),
          eq(horariosBloqueados.horario, dados.horario),
        ),
      )
      .limit(1)

    if (existente) {
      return existente
    }

    const [novoHorario] = await db
      .insert(horariosBloqueados)
      .values({
        nomeBarbeiro: dados.nomeBarbeiro,
        data: dados.data,
        horario: dados.horario,
        motivo: dados.motivo || 'Agendamento',
      })
      .returning()

    return novoHorario
  }

  async deletarPorBarbeiroDataHorario(
    nomeBarbeiro: string,
    data: string,
    horario: string,
  ) {
    const [horarioBloqueado] = await db
      .select()
      .from(horariosBloqueados)
      .where(
        and(
          eq(horariosBloqueados.nomeBarbeiro, nomeBarbeiro),
          eq(horariosBloqueados.data, data),
          eq(horariosBloqueados.horario, horario),
        ),
      )
      .limit(1)

    if (!horarioBloqueado) {
      return { mensagem: 'Horário bloqueado não encontrado' }
    }

    await db
      .delete(horariosBloqueados)
      .where(eq(horariosBloqueados.id, horarioBloqueado.id))

    return { mensagem: 'Horário bloqueado deletado com sucesso' }
  }

  async deletar(id: string) {
    await this.buscarPorId(id)

    await db.delete(horariosBloqueados).where(eq(horariosBloqueados.id, id))

    return { mensagem: 'Horário bloqueado deletado com sucesso' }
  }
}
