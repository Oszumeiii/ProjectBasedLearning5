import { createClient, type RedisClientType } from 'redis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const redisClient: RedisClientType = createClient({ url: REDIS_URL })

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err))

export async function connectRedis(): Promise<void> {
  await redisClient.connect()
  console.log(`✅ Redis connected at ${REDIS_URL}`)
}

export async function pushToQueue(queueName: string, data: object): Promise<void> {
  await redisClient.rPush(queueName, JSON.stringify(data))
}

export { redisClient }
