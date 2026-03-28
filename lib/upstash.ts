import { Redis } from '@upstash/redis'

// Only initialise Redis if real credentials are provided
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_URL.trim() !== '' &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('dummy')

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

// Cache helper functions — silently skip when Redis is not configured
export async function cacheSet(key: string, value: any, expirationSeconds: number = 3600) {
  if (!redis) return null
  return await redis.setex(key, expirationSeconds, JSON.stringify(value))
}

export async function cacheGet(key: string) {
  if (!redis) return null
  const value = await redis.get(key)
  if (!value) return null
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    return value
  }
}

export async function cacheDelete(key: string) {
  if (!redis) return null
  return await redis.del(key)
}
