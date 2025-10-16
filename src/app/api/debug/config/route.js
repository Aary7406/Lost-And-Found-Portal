import { NextResponse } from 'next/server';

// GET /api/debug/config - Show environment configuration (non-sensitive)
export async function GET() {
  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    config: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
}
