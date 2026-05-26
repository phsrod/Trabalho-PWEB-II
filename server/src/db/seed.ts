import { db } from './index.ts'

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    console.log('ℹ️  Nenhum dado inicial necessário no momento.')
    console.log('✅ Seed concluído com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    process.exit(1)
  }
}

seed()
