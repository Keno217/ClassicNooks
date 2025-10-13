import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Useful cache functions for searching books, metadata, etc.
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.error(`Cache retrieval error for key-${key}:`, err);
    return null;
  }
};

// Generic cache setter
export const setCache = async <T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> => {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error(`Cache set error for key-${key}:`, err);
  }
};
