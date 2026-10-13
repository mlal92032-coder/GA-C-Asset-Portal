interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(key: string, options: RateLimitOptions = { maxRequests: 10, windowMs: 60 * 1000 }): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { success: true, remaining: options.maxRequests - 1 };
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    return { success: false, remaining: 0 };
  }

  rateLimitStore.set(key, entry);
  return { success: true, remaining: options.maxRequests - entry.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
