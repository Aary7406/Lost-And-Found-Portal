import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🚪 Director logout requested');
    
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
    
    // Clear the authentication cookie
    response.cookies.set('director-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    console.log('✅ Director logout successful');
    return response;
    
  } catch (error) {
    console.error('❌ Director logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}