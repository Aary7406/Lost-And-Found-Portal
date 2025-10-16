// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  DEFAULT: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  AUTH: { requests: 10, windowMs: 60 * 1000 },     // 10 auth requests per minute
  STRICT: { requests: 30, windowMs: 60 * 1000 }    // 30 requests per minute for sensitive endpoints
};

// Get client identifier (IP address)
function getClientId(request) {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// Check rate limit
export function checkRateLimit(request, limitType = 'DEFAULT') {
  const clientId = getClientId(request);
  const limit = RATE_LIMITS[limitType] || RATE_LIMITS.DEFAULT;
  const key = `${clientId}:${limitType}`;
  
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + limit.windowMs };
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + limit.windowMs;
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  // Check if exceeded
  if (record.count > limit.requests) {
    return {
      allowed: false,
      limit: limit.requests,
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  return {
    allowed: true,
    limit: limit.requests,
    remaining: limit.requests - record.count,
    resetTime: record.resetTime
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + 60000) { // Remove entries older than 1 minute past reset
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Run every minute

export default { checkRateLimit, RATE_LIMITS };
