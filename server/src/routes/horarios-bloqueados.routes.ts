import type { FastifyInstance } from 'fastify'
import { HorariosBloqueadosController } from '../controllers/horarios-bloqueados.controller.ts'

export async function horariosBloqueadosRoutes(app: FastifyInstance) {
  const horariosBloqueadosController = new HorariosBloqueadosController()

  app.get('/', async (request, reply) => {
    return horariosBloqueadosController.listarTodos(request, reply)
  })

  app.get('/data/:data', async (request, reply) => {
    return horariosBloqueadosController.listarPorData(request, reply)
  })

  app.get('/buscar', async (request, reply) => {
    return horariosBloqueadosController.listarPorBarbeiroEData(request, reply)
  })

  app.get('/:id', async (request, reply) => {
    return horariosBloqueadosController.buscarPorId(request, reply)
  })

  app.post('/', async (request, reply) => {
    return horariosBloqueadosController.criar(request, reply)
  })

  app.delete('/:id', async (request, reply) => {
    return horariosBloqueadosController.deletar(request, reply)
  })
}
