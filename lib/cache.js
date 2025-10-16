// In-memory cache for API responses
const cache = new Map();

// Cache Time-To-Live (in milliseconds)
const CACHE_TTL = {
  SHORT: 30 * 1000,    // 30 seconds - for frequently changing data (notifications, admin stats)
  MEDIUM: 2 * 60 * 1000, // 2 minutes - for moderately changing data (claims, reports)
  LONG: 5 * 60 * 1000    // 5 minutes - for rarely changing data (stats, user lists)
};

// Cache key generators
const CACHE_KEYS = {
  STUDENT_STATS: (userId) => `student:stats:${userId}`,
  STUDENT_NOTIFICATIONS: (userId) => `student:notifications:${userId}`,
  STUDENT_CLAIMS: (userId, status) => `student:claims:${userId}:${status || 'all'}`,
  
  ADMIN_STATS: 'admin:stats',
  ADMIN_REPORTS: (status) => `admin:reports:${status || 'all'}`,
  ADMIN_CLAIMS: (status, studentId) => `admin:claims:${status || 'all'}:${studentId || 'all'}`,
  ADMIN_ITEMS: (status, category, search) => `admin:items:${status || 'all'}:${category || 'all'}:${search || ''}`,
  
  DIRECTOR_STATS: 'director:stats'
};

// Cache invalidation patterns
const INVALIDATION_PATTERNS = {
  STUDENT_DATA: /^student:/,
  ADMIN_DATA: /^admin:/,
  DIRECTOR_DATA: /^director:/,
  ALL: /.*/
};

// Set cache with TTL
function set(key, value, ttl = CACHE_TTL.MEDIUM) {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { value, expiresAt });
  
  // Auto-cleanup expired entry after TTL
  setTimeout(() => {
    const entry = cache.get(key);
    if (entry && entry.expiresAt <= Date.now()) {
      cache.delete(key);
    }
  }, ttl);
}

// Get cache (returns null if expired or not found)
function get(key) {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return entry.value;
}

// Invalidate specific key
function invalidate(key) {
  cache.delete(key);
  console.log(`🗑️ Cache invalidated: ${key}`);
}

// Invalidate by pattern (regex)
function invalidatePattern(pattern) {
  let count = 0;
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key);
      count++;
    }
  }
  if (count > 0) {
    console.log(`🗑️ Cache invalidated: ${count} keys matching pattern ${pattern}`);
  }
}

// Clear all cache
function clear() {
  cache.clear();
  console.log('🗑️ Cache cleared completely');
}

// Get cache stats
function stats() {
  let active = 0;
  let expired = 0;
  
  for (const entry of cache.values()) {
    if (entry.expiresAt > Date.now()) {
      active++;
    } else {
      expired++;
    }
  }
  
  return { total: cache.size, active, expired };
}

module.exports = {
  cache: { set, get, invalidate, invalidatePattern, clear, stats },
  CACHE_TTL,
  CACHE_KEYS,
  INVALIDATION_PATTERNS
};
