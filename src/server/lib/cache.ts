type CacheValue<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheValue<unknown>>();

export function setCache<T>(key: string, value: T, ttlSeconds: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheValue<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}
