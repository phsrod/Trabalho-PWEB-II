import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import { registrarRotas } from './routes/index.ts'

export const app = fastify()

// Configuração de CORS
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
})

// Configuração de JWT
app.register(fastifyJwt, {
  secret: 'segredo-que-nao-pode-ser-revelado',
  sign: {
    expiresIn: '7d',
  },
})

// Configuração de Rate Limit — proteção contra força bruta e sobrecarga
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Rota de health check
app.get('/ping', async (_, reply) => reply.send({ message: 'pong' }))

// Registrar todas as rotas
app.register(registrarRotas)

// Iniciar o servidor
app
  .listen({
    host: '0.0.0.0',
    port: 3003,
  })
  .then(() => {
    console.log('🚀 Servidor iniciado na porta 3003!')
    console.log('📍 http://localhost:3003/')
    console.log('📚 Rotas disponíveis:')
    console.log('   - POST   /auth/cadastro')
    console.log('   - POST   /auth/login')
    console.log('   - GET    /auth/verificar-token')
    console.log('   - GET    /api/usuarios/perfil')
    console.log('   - PUT    /api/usuarios/perfil')
    console.log('   - GET    /api/barbeiros')
    console.log('   - GET    /api/barbeiros/:id')
    console.log('   - GET    /api/servicos')
    console.log('   - GET    /api/servicos/:id')
    console.log('   - GET    /api/agendamentos/meus-agendamentos')
    console.log('   - POST   /api/agendamentos')
    console.log('   - DELETE /api/agendamentos/:id/cancelar')
  })
  .catch((err) => {
    console.error('❌ Erro ao iniciar o servidor:', err)
    process.exit(1)
  })
