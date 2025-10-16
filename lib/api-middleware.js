import { NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';

// Middleware wrapper for API routes
export function withMiddleware(handler, options = {}) {
  return async (request, context) => {
    try {
      // Rate limiting
      if (options.rateLimit !== false) {
        const limitType = options.rateLimitType || 'DEFAULT';
        const rateLimitResult = checkRateLimit(request, limitType);
        
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
              }
            }
          );
        }
      }
      
      // Execute handler
      return await handler(request, context);
      
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

export default withMiddleware;
