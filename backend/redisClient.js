// redisClient.js
import Redis from 'ioredis';

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false' && process.env.REDIS_HOST;

let redis = null;

if (REDIS_ENABLED) {
  const redisConfig = {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  };

  redis = new Redis(redisConfig);

  redis.on('connect', () => {
    console.log('Redis client connected successfully!');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  // Attempt connection
  redis.connect().catch((err) => {
    console.warn('Redis connection failed, caching disabled:', err.message);
    redis = null;
  });
} else {
  console.log('Redis disabled - caching will be skipped');
}

// Mock redis methods when disabled
const noopRedis = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 0,
  keys: async () => [],
  setex: async () => 'OK',
  expire: async () => 0,
};

const invalidateCacheByPattern = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(`*${pattern}*`);
    console.log('Invalidating cache keys:', keys);
    await Promise.all(keys.map((key) => redis.del(key)));
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

export default redis || noopRedis;
export { invalidateCacheByPattern };