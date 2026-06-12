import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app.ts'
import { limparBanco } from './helpers/setup.ts'

let app: FastifyInstance
let token: string
let agendamentoId: string

beforeEach(async () => {
  app = await buildApp()
  await limparBanco()

  const authResponse = await app.inject({
    method: 'POST',
    url: '/auth/cadastro',
    payload: {
      nomeCompleto: 'Agenda Teste',
      email: 'agenda@teste.com',
      telefone: '11988887777',
      senha: '123456',
      dataNascimento: '1995-05-10',
    },
  })

  token = authResponse.json().token
})

afterEach(async () => {
  await app.close()
})

describe('POST /api/agendamentos', () => {
  it('deve criar agendamento com sucesso', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/agendamentos',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        nomeBarbeiro: 'Carlos',
        nomeServico: 'Corte Degradê',
        data: '2026-06-20',
        horario: '14:30',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.nomeBarbeiro).toBe('Carlos')
    expect(body.nomeServico).toBe('Corte Degradê')
    expect(body.status).toBe('pendente')
    expect(body.id).toBeDefined()
    agendamentoId = body.id
  })

  it('deve retornar 401 sem autenticação', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/agendamentos',
      payload: {
        nomeBarbeiro: 'Carlos',
        nomeServico: 'Corte Degradê',
        data: '2026-06-20',
        horario: '14:30',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('deve retornar 400 com dados inválidos', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/agendamentos',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        nomeBarbeiro: '',
        nomeServico: '',
        data: 'data-invalida',
        horario: 'horario-invalido',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().mensagem).toBe('Dados inválidos')
  })
})

describe('GET /api/agendamentos/meus-agendamentos', () => {
  beforeEach(async () => {
    await app.inject({
      method: 'POST',
      url: '/api/agendamentos',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        nomeBarbeiro: 'Carlos',
        nomeServico: 'Corte Degradê',
        data: '2026-06-20',
        horario: '14:30',
      },
    })
  })

  it('deve listar agendamentos do usuário logado', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/agendamentos/meus-agendamentos',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(1)
    expect(body[0].nomeBarbeiro).toBe('Carlos')
  })
})

describe('DELETE /api/agendamentos/:id/cancelar', () => {
  beforeEach(async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/agendamentos',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        nomeBarbeiro: 'Carlos',
        nomeServico: 'Corte Degradê',
        data: '2026-06-20',
        horario: '14:30',
      },
    })
    agendamentoId = response.json().id
  })

  it('deve cancelar agendamento com sucesso', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/agendamentos/${agendamentoId}/cancelar`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.status).toBe('cancelado')
  })
})
