import { Pool, type PoolConfig } from 'pg'
import 'dotenv/config'

/**
 * Cấu hình kết nối PostgreSQL từ biến môi trường
 */
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection pool settings cho production
  max: 20, // Số lượng connection tối đa trong pool
  idleTimeoutMillis: 30000, // Thời gian tối đa 1 connection idle (30s)
  connectionTimeoutMillis: 5000 // Timeout khi tạo connection mới (5s)
}

/**
 * Connection Pool - tái sử dụng connection thay vì tạo mới mỗi lần query
 */
const pool = new Pool(dbConfig)

// Log khi có connection error
pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client:', err.message)
  process.exit(-1)
})

// Log khi pool tạo connection mới
pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL')
})

/**
 * Kiểm tra kết nối tới database
 * @returns true nếu kết nối thành công
 */
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

/**
 * Đóng tất cả connections trong pool (dùng khi shutdown server)
 */
export const closePool = async (): Promise<void> => {
  await pool.end()
  console.log('🔌 Database pool has been closed')
}

export default pool
