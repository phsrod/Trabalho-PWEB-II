import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app.ts'
import { limparBanco } from './helpers/setup.ts'

let app: FastifyInstance
let token: string

beforeAll(async () => {
  app = await buildApp()
})

afterAll(async () => {
  await app.close()
})

beforeEach(async () => {
  await limparBanco()

  const response = await app.inject({
    method: 'POST',
    url: '/auth/cadastro',
    payload: {
      nomeCompleto: 'Perfil Teste',
      email: 'perfil@teste.com',
      telefone: '11988887777',
      senha: '123456',
      dataNascimento: '1995-05-10',
    },
  })

  expect(response.statusCode).toBe(201)
  const body = response.json()
  token = body.token
})

describe('GET /api/usuarios/perfil', () => {
  it('deve retornar perfil do usuário autenticado', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/usuarios/perfil',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.email).toBe('perfil@teste.com')
    expect(body.nomeCompleto).toBe('Perfil Teste')
    expect(body.id).toBeDefined()
  })

  it('deve retornar 401 sem token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/usuarios/perfil',
    })

    expect(response.statusCode).toBe(401)
  })
})

describe('PUT /api/usuarios/perfil', () => {
  it('deve atualizar dados do perfil', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/usuarios/perfil',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        nomeCompleto: 'Perfil Atualizado',
        telefone: '11977776666',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.nomeCompleto).toBe('Perfil Atualizado')
    expect(body.telefone).toBe('11977776666')
    expect(body.email).toBe('perfil@teste.com')
  })

  it('deve retornar 401 sem token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/usuarios/perfil',
      payload: {
        nomeCompleto: 'Sem Token',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
