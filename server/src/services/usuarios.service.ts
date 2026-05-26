import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { usuarios } from '../db/schema/index.ts'

interface AtualizarUsuarioInput {
  nomeCompleto?: string
  telefone?: string
  senha?: string
  observacoes?: string
}

export class UsuariosService {
  async buscarPorId(id: string) {
    const [usuario] = await db
      .select({
        id: usuarios.id,
        nomeCompleto: usuarios.nomeCompleto,
        email: usuarios.email,
        telefone: usuarios.telefone,
        dataNascimento: usuarios.dataNascimento,
        observacoes: usuarios.observacoes,
        criadoEm: usuarios.criadoEm,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1)

    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    return usuario
  }

  async atualizar(id: string, dados: AtualizarUsuarioInput) {
    const usuario = await this.buscarPorId(id)

    const dadosAtualizacao: any = {
      atualizadoEm: new Date(),
    }

    if (dados.nomeCompleto) dadosAtualizacao.nomeCompleto = dados.nomeCompleto
    if (dados.telefone) dadosAtualizacao.telefone = dados.telefone
    if (dados.observacoes !== undefined)
      dadosAtualizacao.observacoes = dados.observacoes

    if (dados.senha) {
      dadosAtualizacao.senha = dados.senha
    }

    const [usuarioAtualizado] = await db
      .update(usuarios)
      .set(dadosAtualizacao)
      .where(eq(usuarios.id, id))
      .returning()

    return {
      id: usuarioAtualizado.id,
      nomeCompleto: usuarioAtualizado.nomeCompleto,
      email: usuarioAtualizado.email,
      telefone: usuarioAtualizado.telefone,
      observacoes: usuarioAtualizado.observacoes,
    }
  }

  async deletar(id: string) {
    await this.buscarPorId(id)

    await db.delete(usuarios).where(eq(usuarios.id, id))

    return { mensagem: 'Usuário deletado com sucesso' }
  }
}
