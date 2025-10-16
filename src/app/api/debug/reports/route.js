import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/debug/reports - Debug reported items
export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Get all items with reporter info
    const { data: items, error } = await supabase
      .from('lost_items')
      .select(`
        id,
        name,
        status,
        reported_by_user_id,
        reporter:reported_by_user_id(username, email, first_name, last_name),
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error('Failed to fetch reports');
    }
    
    // Statistics
    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    const withReporter = items.filter(i => i.reported_by_user_id).length;
    
    return NextResponse.json({
      success: true,
      totalItems: items.length,
      itemsByStatus: byStatus,
      itemsWithReporter: withReporter,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        status: i.status,
        hasReporter: !!i.reported_by_user_id,
        reporter: i.reporter ? {
          username: i.reporter.username,
          name: `${i.reporter.first_name} ${i.reporter.last_name}`
        } : null,
        createdAt: i.created_at,
        updatedAt: i.updated_at
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug reports error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
