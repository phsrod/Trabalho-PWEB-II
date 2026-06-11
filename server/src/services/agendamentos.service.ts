import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { agendamentos, usuarios } from '../db/schema/index.ts'
import { HorariosBloqueadosService } from './horarios-bloqueados.service.ts'

interface CriarAgendamentoInput {
  usuarioId: string
  nomeBarbeiro: string
  nomeServico: string
  data: string // formato: YYYY-MM-DD
  horario: string // formato: HH:MM
  observacoes?: string
}

interface AtualizarAgendamentoInput {
  data?: string
  horario?: string
  nomeBarbeiro?: string
  nomeServico?: string
  observacoes?: string
  status?: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'futuro'
}

export class AgendamentosService {
  private horariosBloqueadosService: HorariosBloqueadosService

  constructor() {
    this.horariosBloqueadosService = new HorariosBloqueadosService()
  }

  async listarTodos() {
    return await db
      .select({
        id: agendamentos.id,
        usuarioId: agendamentos.usuarioId,
        nomeBarbeiro: agendamentos.nomeBarbeiro,
        nomeServico: agendamentos.nomeServico,
        data: agendamentos.data,
        horario: agendamentos.horario,
        status: agendamentos.status,
        observacoes: agendamentos.observacoes,
        criadoEm: agendamentos.criadoEm,
      })
      .from(agendamentos)
      .orderBy(agendamentos.data, agendamentos.horario)
  }

  async listarPorUsuario(usuarioId: string) {
    return await db
      .select({
        id: agendamentos.id,
        nomeBarbeiro: agendamentos.nomeBarbeiro,
        nomeServico: agendamentos.nomeServico,
        data: agendamentos.data,
        horario: agendamentos.horario,
        status: agendamentos.status,
        observacoes: agendamentos.observacoes,
        criadoEm: agendamentos.criadoEm,
      })
      .from(agendamentos)
      .where(eq(agendamentos.usuarioId, usuarioId))
      .orderBy(agendamentos.data, agendamentos.horario)
  }

  async buscarPorId(id: string) {
    const [agendamento] = await db
      .select()
      .from(agendamentos)
      .where(eq(agendamentos.id, id))
      .limit(1)

    if (!agendamento) {
      throw new Error('Agendamento não encontrado')
    }

    return agendamento
  }

  async criar(dados: CriarAgendamentoInput) {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, dados.usuarioId))
      .limit(1)

    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    const [novoAgendamento] = await db
      .insert(agendamentos)
      .values({
        usuarioId: dados.usuarioId,
        nomeBarbeiro: dados.nomeBarbeiro,
        nomeServico: dados.nomeServico,
        data: dados.data,
        horario: dados.horario,
        observacoes: dados.observacoes,
        status: 'pendente',
      })
      .returning()

    await this.horariosBloqueadosService.criar({
      nomeBarbeiro: dados.nomeBarbeiro,
      data: dados.data,
      horario: dados.horario,
      motivo: 'Agendamento',
    })

    return novoAgendamento
  }

  async atualizar(id: string, dados: AtualizarAgendamentoInput) {
    await this.buscarPorId(id)

    const [agendamentoAtualizado] = await db
      .update(agendamentos)
      .set({
        ...dados,
        atualizadoEm: new Date(),
      })
      .where(eq(agendamentos.id, id))
      .returning()

    return agendamentoAtualizado
  }

  async cancelar(id: string) {
    const agendamento = await this.buscarPorId(id)

    const [agendamentoCancelado] = await db
      .update(agendamentos)
      .set({
        status: 'cancelado',
        atualizadoEm: new Date(),
      })
      .where(eq(agendamentos.id, id))
      .returning()

    try {
      await this.horariosBloqueadosService.deletarPorBarbeiroDataHorario(
        agendamento.nomeBarbeiro,
        agendamento.data,
        agendamento.horario,
      )
    } catch (error) {}

    return agendamentoCancelado
  }

  async deletar(id: string) {
    await this.buscarPorId(id)

    await db.delete(agendamentos).where(eq(agendamentos.id, id))

    return { mensagem: 'Agendamento deletado com sucesso' }
  }
}
