import { Pool, type PoolConfig } from 'pg'
import 'dotenv/config'


const dbConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 5000 
}


const pool = new Pool(dbConfig)


pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client:', err.message)
  process.exit(-1)
})

pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL')
})


export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('✅ Database connected successfully at:', result.rows[0].now)
    client.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message)
    return false
  }
}


export const closePool = async (): Promise<void> => {
  await pool.end()
  console.log('🔌 Database pool has been closed')
}

export default pool
