import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    
    // Get student count
    const { count: studentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    // Get items stats
    const { data: allItems } = await supabase
      .from('lost_items')
      .select('type, status');
    
    const stats = {
      students: {
        total: studentCount || 0
      },
      items: {
        lost: allItems?.filter(i => i.type === 'lost').length || 0,
        found: allItems?.filter(i => i.type === 'found').length || 0,
        pending: allItems?.filter(i => i.status === 'pending').length || 0,
        approved: allItems?.filter(i => i.status === 'approved').length || 0,
        claimed: allItems?.filter(i => i.status === 'claimed').length || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('API Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
