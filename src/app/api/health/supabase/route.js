import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/health/supabase - Check Supabase connection health
export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase health check failed:', error);
      return NextResponse.json({
        success: false,
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'Supabase connection is working',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
