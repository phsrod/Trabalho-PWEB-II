import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app.ts'
import { limparBanco } from './helpers/setup.ts'

let app: FastifyInstance

beforeEach(async () => {
  app = await buildApp()
  await limparBanco()
})

afterEach(async () => {
  await app.close()
})

describe('POST /auth/cadastro', () => {
  it('deve cadastrar usuário com sucesso e retornar token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'Maria Teste',
        email: 'maria@teste.com',
        telefone: '11988887777',
        senha: '123456',
        dataNascimento: '1995-05-10',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.token).toBeDefined()
    expect(body.usuario.email).toBe('maria@teste.com')
    expect(body.usuario.nomeCompleto).toBe('Maria Teste')
  })

  it('deve retornar 400 com dados inválidos', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'AB',
        email: 'email-invalido',
        telefone: '123',
        senha: '12',
        dataNascimento: 'data-ruim',
      },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.mensagem).toBe('Dados inválidos')
    expect(body.erros.length).toBeGreaterThan(0)
  })

  it('deve retornar 400 quando email já está em uso', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'Primeiro',
        email: 'duplicado@teste.com',
        telefone: '11988887777',
        senha: '123456',
        dataNascimento: '1995-05-10',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'Segundo',
        email: 'duplicado@teste.com',
        telefone: '11988887777',
        senha: '123456',
        dataNascimento: '1995-05-10',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().mensagem).toBe('Email já cadastrado')
  })
})

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'João Login',
        email: 'joao@login.com',
        telefone: '11988887777',
        senha: '123456',
        dataNascimento: '1995-05-10',
      },
    })
  })

  it('deve logar com credenciais válidas', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'joao@login.com',
        senha: '123456',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token).toBeDefined()
    expect(body.usuario.email).toBe('joao@login.com')
  })

  it('deve retornar 401 com senha incorreta', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'joao@login.com',
        senha: 'senha-errada',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().mensagem).toBe('Email ou senha inválidos')
  })

  it('deve retornar 401 com email inexistente', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'naoexiste@teste.com',
        senha: '123456',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().mensagem).toBe('Email ou senha inválidos')
  })
})

describe('GET /auth/verificar-token', () => {
  let token: string

  beforeEach(async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/cadastro',
      payload: {
        nomeCompleto: 'Token Test',
        email: 'token@teste.com',
        telefone: '11988887777',
        senha: '123456',
        dataNascimento: '1995-05-10',
      },
    })
    token = response.json().token
  })

  it('deve validar token válido', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/verificar-token',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().valido).toBe(true)
  })

  it('deve rejeitar token inválido', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/verificar-token',
      headers: {
        authorization: 'Bearer token-invalido',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().valido).toBe(false)
  })
})
