import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a single, reusable Redis client instance
export const redis = new IORedis(redisUrl);

redis.on('connect', () => console.log('🚀 Connected to Redis!'));
redis.on('error', (err) => console.error('Redis connection error:', err));
