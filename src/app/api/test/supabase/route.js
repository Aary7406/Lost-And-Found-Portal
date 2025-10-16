import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../../lib/supabase';

// GET /api/test/supabase - Test Supabase queries and return sample data
export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Test multiple queries
    const results = {};
    
    // Test users table
    const { data: usersCount, error: usersError } = await supabase
      .from('users')
      .select('count');
    
    results.users = {
      success: !usersError,
      count: usersCount?.[0]?.count || 0,
      error: usersError?.message || null
    };
    
    // Test lost_items table
    const { data: itemsCount, error: itemsError } = await supabase
      .from('lost_items')
      .select('count');
    
    results.items = {
      success: !itemsError,
      count: itemsCount?.[0]?.count || 0,
      error: itemsError?.message || null
    };
    
    // Test a simple select query
    const { data: sampleItems, error: sampleError } = await supabase
      .from('lost_items')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    results.sampleItems = {
      success: !sampleError,
      data: sampleItems || [],
      error: sampleError?.message || null
    };
    
    // Overall status
    const allSuccess = results.users.success && results.items.success && results.sampleItems.success;
    
    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? 'All Supabase tests passed' : 'Some tests failed',
      timestamp: new Date().toISOString(),
      results
    }, { status: allSuccess ? 200 : 500 });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed with exception',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
