import { NextResponse } from 'next/server';

// Create error response
export function createErrorResponse(message, status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  );
}

// Create success response
export function createSuccessResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data
    },
    { status }
  );
}

// Verify authentication token (simplified)
export function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // In production, verify JWT token here
  // For now, return mock user
  return { id: 'user-123', role: 'student' };
}
