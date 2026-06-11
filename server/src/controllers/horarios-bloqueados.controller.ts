import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { HorariosBloqueadosService } from '../services/horarios-bloqueados.service.ts'

const criarHorarioBloqueadoSchema = z.object({
  nomeBarbeiro: z.string().min(1, 'Nome do barbeiro é obrigatório'),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (use HH:MM)'),
  motivo: z.string().optional(),
})

export class HorariosBloqueadosController {
  private horariosBloqueadosService: HorariosBloqueadosService

  constructor() {
    this.horariosBloqueadosService = new HorariosBloqueadosService()
  }

  async listarTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const horarios = await this.horariosBloqueadosService.listarTodos()
      return reply.status(200).send(horarios)
    } catch (error) {
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async listarPorData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { data } = request.params as { data: string }

      if (!data) {
        return reply.status(400).send({ mensagem: 'Data é obrigatória' })
      }

      const horarios = await this.horariosBloqueadosService.listarPorData(data)
      return reply.status(200).send(horarios)
    } catch (error) {
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async listarPorBarbeiroEData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { nomeBarbeiro, data } = request.query as {
        nomeBarbeiro?: string
        data?: string
      }

      if (!nomeBarbeiro || !data) {
        return reply.status(400).send({
          mensagem: 'Nome do barbeiro e data são obrigatórios',
        })
      }

      const horarios =
        await this.horariosBloqueadosService.listarPorBarbeiroEData(
          nomeBarbeiro,
          data,
        )

      return reply.status(200).send(horarios)
    } catch (error) {
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const horario = await this.horariosBloqueadosService.buscarPorId(id)
      return reply.status(200).send(horario)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({ mensagem: error.message })
      }
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = criarHorarioBloqueadoSchema.parse(request.body)

      const novoHorario = await this.horariosBloqueadosService.criar(dados)

      return reply.status(201).send(novoHorario)
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

  async deletar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await this.horariosBloqueadosService.deletar(id)
      return reply
        .status(200)
        .send({ mensagem: 'Horário bloqueado deletado com sucesso' })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({ mensagem: error.message })
      }
      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }
}
