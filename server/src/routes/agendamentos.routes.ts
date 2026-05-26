import type { FastifyInstance } from 'fastify'
import { AgendamentosController } from '../controllers/agendamentos.controller.ts'

export async function agendamentosRoutes(app: FastifyInstance) {
  const agendamentosController = new AgendamentosController()

  app.get('/', async (request, reply) => {
    return agendamentosController.listarTodos(request, reply)
  })

  app.get('/meus-agendamentos', async (request, reply) => {
    return agendamentosController.listarPorUsuario(request, reply)
  })

  app.get('/:id', async (request, reply) => {
    return agendamentosController.buscarPorId(request, reply)
  })

  app.post('/', async (request, reply) => {
    return agendamentosController.criar(request, reply)
  })

  app.put('/:id', async (request, reply) => {
    return agendamentosController.atualizar(request, reply)
  })

  app.patch('/:id/cancelar', async (request, reply) => {
    return agendamentosController.cancelar(request, reply)
  })

  app.delete('/:id', async (request, reply) => {
    return agendamentosController.deletar(request, reply)
  })
}
