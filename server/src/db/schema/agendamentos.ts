import { date, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usuarios } from './usuarios.ts'

export const agendamentos = pgTable('agendamentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  nomeBarbeiro: text('nome_barbeiro').notNull(),
  nomeServico: text('nome_servico').notNull(),
  data: date('data').notNull(),
  horario: time('horario').notNull(),
  status: text('status')
    .notNull()
    .default('pendente')
    .$type<'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'futuro'>(),
  observacoes: text('observacoes'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
