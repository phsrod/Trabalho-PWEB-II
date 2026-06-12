import { buildApp } from './app.ts'

const app = await buildApp()

app
  .listen({
    host: '0.0.0.0',
    port: 3003,
  })
  .then(() => {
    console.log('🚀 Servidor iniciado na porta 3003!')
    console.log('📍 http://localhost:3003/')
    console.log('📚 Rotas disponíveis:')
    console.log('   - POST   /auth/cadastro')
    console.log('   - POST   /auth/login')
    console.log('   - GET    /auth/verificar-token')
    console.log('   - GET    /api/usuarios/perfil')
    console.log('   - PUT    /api/usuarios/perfil')
    console.log('   - GET    /api/barbeiros')
    console.log('   - GET    /api/barbeiros/:id')
    console.log('   - GET    /api/servicos')
    console.log('   - GET    /api/servicos/:id')
    console.log('   - GET    /api/agendamentos/meus-agendamentos')
    console.log('   - POST   /api/agendamentos')
    console.log('   - DELETE /api/agendamentos/:id/cancelar')
  })
  .catch(err => {
    console.error('❌ Erro ao iniciar o servidor:', err)
    process.exit(1)
  })
