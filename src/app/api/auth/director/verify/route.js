import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET /api/auth/director/verify - Check if endpoint is available
export async function GET(request) {
  return createSuccessResponse({
    endpoint: '/api/auth/director/verify',
    status: 'available',
    method: 'POST',
    description: 'Verify director JWT token',
    requiredBody: {
      token: 'string (JWT token)'
    }
  });
}

// POST /api/auth/director/verify - Verify director JWT token
export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return createErrorResponse('Token is required', 400);
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user is a director
    if (decoded.role !== 'director') {
      return createErrorResponse('Not authorized as director', 403);
    }
    
    return createSuccessResponse({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return createErrorResponse('Token expired', 401);
    }
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Token verification failed', 500);
  }
}
