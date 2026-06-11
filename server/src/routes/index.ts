import type { FastifyInstance } from 'fastify'
import { agendamentosRoutes } from './agendamentos.routes.ts'
import { autenticacaoRoutes } from './autenticacao.routes.ts'
import { horariosBloqueadosRoutes } from './horarios-bloqueados.routes.ts'
import { usuariosRoutes } from './usuarios.routes.ts'

export async function registrarRotas(app: FastifyInstance) {
  app.register(autenticacaoRoutes, { prefix: '/auth' })

  app.register(usuariosRoutes, { prefix: '/api/usuarios' })
  app.register(agendamentosRoutes, { prefix: '/api/agendamentos' })
  app.register(horariosBloqueadosRoutes, {
    prefix: '/api/horarios-bloqueados',
  })
}
