import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/director/login - Director login
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return createErrorResponse('Username and password are required', 400);
    }
    
    const supabase = getSupabase();
    
    // Find user by username
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'director')
      .limit(1);
    
    if (fetchError) {
      console.error('Database error:', fetchError);
      throw new Error('Failed to authenticate');
    }
    
    if (!users || users.length === 0) {
      return createErrorResponse('Invalid username or password', 401);
    }
    
    const user = users[0];
    
    // Verify password (simple comparison - in production use bcrypt)
    if (user.password !== password) {
      return createErrorResponse('Invalid username or password', 401);
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    const response = createSuccessResponse({
      message: 'Director login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token
    });
    
    // Set token as HTTP-only cookie for security
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Login failed', 500);
  }
}