import app from './app'
import { testConnection } from './config/db'
import { PORT } from './config/env'
import { startScheduler } from './jobs/scheduler'

const name: string = 'Project Based Learning 5'
console.log(`Welcome to ${name}`)

async function bootstrap() {
  const ok = await testConnection()
  if (!ok) {
    console.error('❌ Cannot connect to database, exiting...')
    process.exit(1)
  }

  startScheduler()

  app.listen(PORT, () => {
    console.log(`🚀 App is ready! Listening on http://localhost:${PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('❌ Unexpected error during bootstrap:', err)
  process.exit(1)
})