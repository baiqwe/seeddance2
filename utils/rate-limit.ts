type RateLimitState = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitState>>();

function getStore(name: string) {
  let store = stores.get(name);
  if (!store) {
    store = new Map<string, RateLimitState>();
    stores.set(name, store);
  }
  return store;
}

export function consumeRateLimit(opts: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const store = getStore(opts.scope);
  const current = store.get(opts.key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + opts.windowMs };
    store.set(opts.key, next);
    return {
      allowed: true,
      remaining: Math.max(opts.limit - 1, 0),
      resetAt: next.resetAt,
    };
  }

  if (current.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  store.set(opts.key, current);

  return {
    allowed: true,
    remaining: Math.max(opts.limit - current.count, 0),
    resetAt: current.resetAt,
  };
}
