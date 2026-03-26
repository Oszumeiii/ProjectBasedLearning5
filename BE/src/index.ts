import app from './app'
import { testConnection } from './config/db'
import { PORT } from './config/env'
import { startScheduler } from './jobs/scheduler'
import { ensureBucket } from './services/storage.service'

const name: string = 'Project Based Learning 5'
console.log(`Welcome to ${name}`)

async function bootstrap() {
  const ok = await testConnection()
  if (!ok) {
    console.error('❌ Cannot connect to database, exiting...')
    process.exit(1)
  }

  startScheduler()

  try {
    await ensureBucket()
    console.log('✅ MinIO bucket ready')
  } catch (err) {
    console.warn('⚠️ MinIO not available — file upload sẽ không hoạt động:', (err as Error).message)
  }

  app.listen(PORT, () => {
    console.log(`🚀 App is ready! Listening on http://localhost:${PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('❌ Unexpected error during bootstrap:', err)
  process.exit(1)
})