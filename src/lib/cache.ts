import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Useful cache functions for searching books, metadata, etc.
export const getCache = async (key: string) => {
  try {
    const data: any = await redis.get(key);
    return data ? data : null;
  } catch (err) {
    console.log(`Cache retrieval error for key-${key}:`, err);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttlSeconds: number) => {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.log(`Cache set error for key-${key}:`, err);
  }
};
