import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Limit for login/register
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

// Limit for browsing (books, metadata, etc.)
export const defRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, '1 m'),
  analytics: true,
});

// Limit for scraping
export const dailyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10000, '1 d'),
  analytics: true,
});
