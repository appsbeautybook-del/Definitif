import { cacheGet, cacheSet, cachePattern, makeCacheKey, TTL } from '../config/cache.js';

export function cacheMiddleware(keyPrefix, ttlMs = TTL.MEDIUM) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = makeCacheKey(keyPrefix, { ...req.query, url: req.originalUrl });
    const cached = cacheGet(key);
    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, data, ttlMs);
      }
      return originalJson(data);
    };
    next();
  };
}

export function invalidateOnWrite(pattern) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cleared = cachePattern(pattern);
        if (cleared > 0) console.log(`[cache] invalidated ${cleared} keys for ${pattern}`);
      }
      return originalJson(data);
    };
    next();
  };
}

export default cacheMiddleware;
