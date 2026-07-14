import Redis from 'ioredis'
import { logger } from '@/lib/logger'

// Redis connection singleton
let redisClient: Redis | null = null
let redisSubscriber: Redis | null = null

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  redisClient = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  redisClient.on('connect', () => {
    logger.info('Redis client connected')
  })

  redisClient.on('error', (err) => {
    logger.error('Redis client error', { error: err.message })
  })

  redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting')
  })

  return redisClient
}

/**
 * Get or create Redis subscriber (for pub/sub)
 */
export function getRedisSubscriber(): Redis {
  if (redisSubscriber) {
    return redisSubscriber
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  redisSubscriber = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  redisSubscriber.on('connect', () => {
    logger.info('Redis subscriber connected')
  })

  redisSubscriber.on('error', (err) => {
    logger.error('Redis subscriber error', { error: err.message })
  })

  return redisSubscriber
}

/**
 * Set value with expiration
 */
export async function setWithExpiration(
  key: string,
  value: string | Record<string, any>,
  expirationSeconds: number = 3600,
): Promise<void> {
  const client = getRedisClient()
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  await client.setex(key, expirationSeconds, stringValue)
}

/**
 * Get value
 */
export async function getValue<T = string>(key: string): Promise<T | null> {
  const client = getRedisClient()
  const value = await client.get(key)

  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return value as unknown as T
  }
}

/**
 * Delete value
 */
export async function deleteKey(key: string): Promise<void> {
  const client = getRedisClient()
  await client.del(key)
}

/**
 * Check if key exists
 */
export async function keyExists(key: string): Promise<boolean> {
  const client = getRedisClient()
  const exists = await client.exists(key)
  return exists === 1
}

/**
 * Increment counter
 */
export async function incrementCounter(key: string, amount: number = 1): Promise<number> {
  const client = getRedisClient()
  return client.incrby(key, amount)
}

/**
 * Decrement counter
 */
export async function decrementCounter(key: string, amount: number = 1): Promise<number> {
  const client = getRedisClient()
  return client.decrby(key, amount)
}

/**
 * Publish message to channel
 */
export async function publishMessage(channel: string, message: any): Promise<void> {
  const client = getRedisClient()
  const stringMessage = typeof message === 'string' ? message : JSON.stringify(message)
  await client.publish(channel, stringMessage)
}

/**
 * Subscribe to channel
 */
export async function subscribeToChannel(
  channel: string,
  callback: (message: any) => void,
): Promise<void> {
  const subscriber = getRedisSubscriber()

  subscriber.on('message', (chan, message) => {
    if (chan === channel) {
      try {
        const parsed = JSON.parse(message)
        callback(parsed)
      } catch {
        callback(message)
      }
    }
  })

  await subscriber.subscribe(channel)
}

/**
 * Unsubscribe from channel
 */
export async function unsubscribeFromChannel(channel: string): Promise<void> {
  const subscriber = getRedisSubscriber()
  await subscriber.unsubscribe(channel)
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getRedisClient()
    const pong = await client.ping()
    return pong === 'PONG'
  } catch (error) {
    logger.error('Redis health check failed', { error: String(error) })
    return false
  }
}

/**
 * Graceful shutdown
 */
export async function closeRedisConnections(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }

  if (redisSubscriber) {
    await redisSubscriber.quit()
    redisSubscriber = null
  }

  logger.info('Redis connections closed')
}
