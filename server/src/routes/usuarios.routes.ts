import type { FastifyInstance } from 'fastify'
import { UsuariosController } from '../controllers/usuarios.controller.ts'

export async function usuariosRoutes(app: FastifyInstance) {
  const usuariosController = new UsuariosController()

  app.get('/perfil', async (request, reply) => {
    return usuariosController.buscarPerfil(request, reply)
  })

  app.put('/perfil', async (request, reply) => {
    return usuariosController.atualizar(request, reply)
  })

  app.delete('/perfil', async (request, reply) => {
    return usuariosController.deletar(request, reply)
  })
}
