import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import { registrarRotas } from './routes/index.ts'

export async function buildApp() {
  const app = fastify()

  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })

  await app.register(fastifyJwt, {
    secret: 'segredo-que-nao-pode-ser-revelado',
    sign: {
      expiresIn: '7d',
    },
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  app.get('/ping', async (_, reply) => reply.send({ message: 'pong' }))

  await app.register(registrarRotas)

  return app
}
