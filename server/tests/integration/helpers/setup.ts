import { sql } from 'drizzle-orm'
import { db } from '../../../src/db/index.ts'

export async function limparBanco() {
  await db.execute(
    sql`TRUNCATE TABLE agendamentos, horarios_bloqueados, usuarios CASCADE`,
  )
}
