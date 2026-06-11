import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { AgendamentosService } from '../services/agendamentos.service.ts'

const criarAgendamentoSchema = z.object({
  nomeBarbeiro: z.string().min(1, 'Nome do barbeiro é obrigatório'),
  nomeServico: z.string().min(1, 'Nome do serviço é obrigatório'),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (use HH:MM)'),
  observacoes: z.string().optional(),
})

const atualizarAgendamentoSchema = z.object({
  nomeBarbeiro: z.string().min(1).optional(),
  nomeServico: z.string().min(1).optional(),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  horario: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  observacoes: z.string().optional(),
  status: z
    .enum(['pendente', 'confirmado', 'concluido', 'cancelado', 'futuro'])
    .optional(),
})

export class AgendamentosController {
  private agendamentosService: AgendamentosService

  constructor() {
    this.agendamentosService = new AgendamentosService()
  }

  async listarTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()

      const agendamentos = await this.agendamentosService.listarTodos()

      return reply.status(200).send(agendamentos)
    } catch (error) {
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async listarPorUsuario(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
      const userId = (request.user as any).id

      const agendamentos =
        await this.agendamentosService.listarPorUsuario(userId)

      return reply.status(200).send(agendamentos)
    } catch (error) {
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()

      const { id } = request.params as { id: string }

      const agendamento = await this.agendamentosService.buscarPorId(id)

      return reply.status(200).send(agendamento)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
      const userId = (request.user as any).id

      const dados = criarAgendamentoSchema.parse(request.body)

      const novoAgendamento = await this.agendamentosService.criar({
        ...dados,
        usuarioId: userId,
      })

      return reply.status(201).send(novoAgendamento)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          mensagem: 'Dados inválidos',
          erros: error.issues.map(e => ({
            campo: e.path.join('.'),
            mensagem: e.message,
          })),
        })
      }

      if (error instanceof Error) {
        return reply.status(400).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()

      const { id } = request.params as { id: string }
      const dados = atualizarAgendamentoSchema.parse(request.body)

      const agendamentoAtualizado = await this.agendamentosService.atualizar(
        id,
        dados,
      )

      return reply.status(200).send(agendamentoAtualizado)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          mensagem: 'Dados inválidos',
          erros: error.issues.map(e => ({
            campo: e.path.join('.'),
            mensagem: e.message,
          })),
        })
      }

      if (error instanceof Error) {
        return reply.status(400).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async cancelar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()

      const { id } = request.params as { id: string }

      const agendamentoCancelado = await this.agendamentosService.cancelar(id)

      return reply.status(200).send(agendamentoCancelado)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async deletar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()

      const { id } = request.params as { id: string }

      const resultado = await this.agendamentosService.deletar(id)

      return reply.status(200).send(resultado)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }
}
