import { date, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'

export const horariosBloqueados = pgTable('horarios_bloqueados', {
  id: uuid('id').primaryKey().defaultRandom(),
  nomeBarbeiro: text('nome_barbeiro').notNull(),
  data: date('data').notNull(),
  horario: time('horario').notNull(),
  motivo: text('motivo'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
