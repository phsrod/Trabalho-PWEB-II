import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { AutenticacaoService } from '../services/autenticacao.service.ts'

const cadastroSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export class AutenticacaoController {
  private autenticacaoService: AutenticacaoService

  constructor(app: any) {
    this.autenticacaoService = new AutenticacaoService(app)
  }

  async cadastrar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = cadastroSchema.parse(request.body)

      const resultado = await this.autenticacaoService.cadastrar(dados)

      return reply.status(201).send(resultado)
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

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = loginSchema.parse(request.body)

      const resultado = await this.autenticacaoService.login(dados)

      return reply.status(200).send(resultado)
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
        return reply.status(401).send({ mensagem: error.message })
      }

      return reply.status(500).send({ mensagem: 'Erro interno do servidor' })
    }
  }

  async verificarToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
      return reply.status(200).send({ valido: true, usuario: request.user })
    } catch (error) {
      return reply
        .status(401)
        .send({ valido: false, mensagem: 'Token inválido' })
    }
  }
}
