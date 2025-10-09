import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Limits for login/register
export const authShortLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'),
  analytics: true,
});

export const authDailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 d'),
  analytics: true,
});

// Limits for browsing (books, metadata, etc.)
export const defLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1 m'),
  analytics: true,
});

export const dailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5000, '1 d'),
  analytics: true,
});

// Limit for authenticated user actions
export const userDaily = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 d'),
  analytics: true,
});
