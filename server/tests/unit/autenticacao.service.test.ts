import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = vi.hoisted(() => {
  const createSelectChain = (result: object[]) => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve(result)),
      })),
    })),
  })

  return {
    select: vi.fn(),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([
            {
              id: 'new-id-123',
              nomeCompleto: 'Novo Usuário',
              email: 'novo@email.com',
              telefone: '11988888888',
            },
          ]),
        ),
      })),
    })),
    createSelectChain,
  }
})

const mockBcrypt = vi.hoisted(() => ({
  hash: vi.fn(() => Promise.resolve('hashed-password-123')),
  compare: vi.fn(() => Promise.resolve(true)),
}))

vi.mock('../../src/db/index.ts', () => ({ db: mockDb }))
vi.mock('bcrypt', () => ({ default: mockBcrypt, ...mockBcrypt }))

import { AutenticacaoService } from '../../src/services/autenticacao.service.ts'

function createMockApp() {
  return {
    jwt: {
      sign: vi.fn().mockReturnValue('fake-jwt-token'),
      verify: vi.fn(),
    },
  }
}

describe('AutenticacaoService (unitário)', () => {
  let service: AutenticacaoService
  let mockApp: ReturnType<typeof createMockApp>

  beforeEach(() => {
    vi.clearAllMocks()
    mockApp = createMockApp() as any
    service = new AutenticacaoService(mockApp as any)
  })

  describe('login', () => {
    it('deve retornar token e dados do usuário quando credenciais são válidas', async () => {
      mockDb.select.mockReturnValue(
        mockDb.createSelectChain([
          {
            id: 'user-id-abc',
            nomeCompleto: 'João Silva',
            email: 'joao@email.com',
            telefone: '11999999999',
            senha: 'hashed-password-123',
          },
        ]),
      )

      const result = await service.login({
        email: 'joao@email.com',
        senha: '123456',
      })

      expect(result.token).toBe('fake-jwt-token')
      expect(result.usuario.email).toBe('joao@email.com')
      expect(result.usuario.nomeCompleto).toBe('João Silva')
      expect(mockApp.jwt.sign).toHaveBeenCalledTimes(1)
    })

    it('deve lançar erro quando email não existe', async () => {
      mockDb.select.mockReturnValue(mockDb.createSelectChain([]))

      await expect(
        service.login({
          email: 'naoexiste@email.com',
          senha: '123456',
        }),
      ).rejects.toThrow('Email ou senha inválidos')

      expect(mockApp.jwt.sign).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando senha está incorreta', async () => {
      mockDb.select.mockReturnValue(
        mockDb.createSelectChain([
          {
            id: 'user-id-abc',
            nomeCompleto: 'João Silva',
            email: 'joao@email.com',
            senha: 'hashed-password-123',
          },
        ]),
      )

      mockBcrypt.compare.mockResolvedValueOnce(false)

      await expect(
        service.login({
          email: 'joao@email.com',
          senha: 'senha-errada',
        }),
      ).rejects.toThrow('Email ou senha inválidos')

      expect(mockApp.jwt.sign).not.toHaveBeenCalled()
    })
  })

  describe('cadastrar', () => {
    it('deve criar usuário e retornar token + dados', async () => {
      mockDb.select.mockReturnValue(mockDb.createSelectChain([]))

      const result = await service.cadastrar({
        nomeCompleto: 'Novo Usuário',
        email: 'novo@email.com',
        telefone: '11988888888',
        senha: '123456',
        dataNascimento: '2000-01-01',
      })

      expect(result.token).toBe('fake-jwt-token')
      expect(result.usuario.email).toBe('novo@email.com')
      expect(result.usuario.nomeCompleto).toBe('Novo Usuário')
      expect(mockBcrypt.hash).toHaveBeenCalledWith('123456', 10)
      expect(mockApp.jwt.sign).toHaveBeenCalledTimes(1)
    })

    it('deve lançar erro quando email já está cadastrado', async () => {
      mockDb.select.mockReturnValue(
        mockDb.createSelectChain([
          {
            id: 'existing-id',
            email: 'existente@email.com',
          },
        ]),
      )

      await expect(
        service.cadastrar({
          nomeCompleto: 'Usuário Duplicado',
          email: 'existente@email.com',
          telefone: '11988888888',
          senha: '123456',
          dataNascimento: '2000-01-01',
        }),
      ).rejects.toThrow('Email já cadastrado')

      expect(mockDb.insert).not.toHaveBeenCalled()
      expect(mockApp.jwt.sign).not.toHaveBeenCalled()
    })
  })
})
