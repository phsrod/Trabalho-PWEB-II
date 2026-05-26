import type { FastifyInstance } from 'fastify'
import { AutenticacaoController } from '../controllers/autenticacao.controller.ts'

export async function autenticacaoRoutes(app: FastifyInstance) {
  const autenticacaoController = new AutenticacaoController(app)

  app.post('/cadastro', async (request, reply) => {
    return autenticacaoController.cadastrar(request, reply)
  })

  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    return autenticacaoController.login(request, reply)
  })

  app.get('/verificar-token', async (request, reply) => {
    return autenticacaoController.verificarToken(request, reply)
  })
}
