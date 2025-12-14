import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';

// Disable caching for real-time stats
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabase = getSupabase();
    
    // Get student count
    const { count: studentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    // Get items stats - use item_type column (not type)
    const { data: allItems } = await supabase
      .from('lost_items')
      .select('item_type, status');
    
    const stats = {
      students: {
        total: studentCount || 0
      },
      items: {
        lost: allItems?.filter(i => i.item_type === 'lost').length || 0,
        found: allItems?.filter(i => i.item_type === 'found').length || 0,
        pending: allItems?.filter(i => i.status === 'pending').length || 0,
        claimed: allItems?.filter(i => i.status === 'claimed').length || 0,
        total: allItems?.length || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      stats
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('API Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
