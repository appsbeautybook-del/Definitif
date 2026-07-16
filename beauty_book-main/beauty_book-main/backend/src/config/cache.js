import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 10000,
  ttl: 1000 * 60 * 5,
  allowStale: true,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

export function cacheGet(key) {
  return cache.get(key);
}

export function cacheSet(key, value, ttlMs) {
  cache.set(key, value, { ttl: ttlMs });
}

export function cacheDel(key) {
  cache.delete(key);
}

export function cachePattern(pattern) {
  const keys = [...cache.keys()];
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  let count = 0;
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }
  return count;
}

export function cacheStats() {
  return {
    size: cache.size,
    max: cache.max,
    calculatedSize: cache.calculatedSize,
  };
}

export const TTL = {
  SHORT: 1000 * 30,
  MEDIUM: 1000 * 60 * 2,
  LONG: 1000 * 60 * 10,
  VERY_LONG: 1000 * 60 * 30,
  FEED: 1000 * 15,
  PROFILE: 1000 * 60 * 5,
  COMMENTS: 1000 * 30,
  LIKES: 1000 * 10,
  SEARCH: 1000 * 60 * 3,
};

export function makeCacheKey(prefix, params) {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&');
  return `${prefix}:${sorted}`;
}

export default cache;
