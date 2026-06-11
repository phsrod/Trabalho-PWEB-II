import { date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nomeCompleto: text('nome_completo').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').notNull(),
  senha: text('senha').notNull(),
  dataNascimento: date('data_nascimento').notNull(),
  observacoes: text('observacoes'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
