import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UsuariosService } from '../services/usuarios.service.ts'

const atualizarUsuarioSchema = z.object({
  nomeCompleto: z.string().min(3).optional(),
  telefone: z.string().min(10).optional(),
  senha: z.string().min(6).optional(),
  observacoes: z.string().optional(),
})

export class UsuariosController {
  private usuariosService: UsuariosService

  constructor() {
    this.usuariosService = new UsuariosService()
  }

  async buscarPerfil(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
      const userId = (request.user as any).id

      const usuario = await this.usuariosService.buscarPorId(userId)

      return reply.status(200).send(usuario)
    } catch (error) {
      if ((error as any).statusCode === 401) {
        return reply.status(401).send({ mensagem: 'Não autorizado' })
      }

      if (error instanceof Error) {
        return reply.status(404).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
      const userId = (request.user as any).id

      const dados = atualizarUsuarioSchema.parse(request.body)

      const usuarioAtualizado = await this.usuariosService.atualizar(
        userId,
        dados,
      )

      return reply.status(200).send(usuarioAtualizado)
    } catch (error) {
      if ((error as any).statusCode === 401) {
        return reply.status(401).send({ mensagem: 'Não autorizado' })
      }

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
      await request.jwtVerify()
      const userId = (request.user as any).id

      const resultado = await this.usuariosService.deletar(userId)

      return reply.status(200).send(resultado)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }
}
