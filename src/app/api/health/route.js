import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: !error,
        message: error ? error.message : 'Connected'
      },
      environment: {
        node: process.env.NODE_ENV || 'development',
        nextjs: '16.0.5'
      }
    };
    
    return NextResponse.json(health);
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
