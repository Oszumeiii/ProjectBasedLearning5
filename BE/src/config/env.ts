import 'dotenv/config'

export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = Number(process.env.PORT) || 3000

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Please set it in your .env file.')
}

