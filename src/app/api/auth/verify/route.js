import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/verify - Verify JWT token and return user data
export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return createErrorResponse('Token is required', 400);
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return createSuccessResponse({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        student_id: decoded.student_id
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

// GET /api/auth/verify - Verify token from cookie or Authorization header
export async function GET(request) {
  try {
    // Try Authorization header first, then cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }
    
    if (!token) {
      return createErrorResponse('No authentication token found', 401);
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return createSuccessResponse({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        student_id: decoded.student_id
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
