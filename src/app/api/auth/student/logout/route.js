import { NextResponse } from 'next/server';
import { createSuccessResponse } from '../../../../../../lib/supabase-auth';

// POST /api/auth/student/logout - Student logout
export async function POST(request) {
  const response = createSuccessResponse({
    message: 'Logged out successfully'
  });
  
  // Clear the auth token cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });
  
  return response;
}
