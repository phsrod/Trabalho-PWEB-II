import type { FastifyInstance } from 'fastify'
import { AutenticacaoController } from '../controllers/autenticacao.controller.ts'

export async function autenticacaoRoutes(app: FastifyInstance) {
  const autenticacaoController = new AutenticacaoController(app)

  // Cadastro de novo usuário
  app.post('/cadastro', async (request, reply) => {
    return autenticacaoController.cadastrar(request, reply)
  })

  // Login — limite restrito: 5 tentativas por minuto por IP
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

  // Verificar token
  app.get('/verificar-token', async (request, reply) => {
    return autenticacaoController.verificarToken(request, reply)
  })
}
