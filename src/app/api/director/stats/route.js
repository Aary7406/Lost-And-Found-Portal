import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../../../lib/cache';

// GET /api/director/stats - Director dashboard statistics
export async function GET() {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.DIRECTOR_STATS;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Director stats');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Director stats - fetching from database');

    const supabase = getSupabase();
    
    // Get total users by role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role');
    
    if (usersError) {
      throw new Error('Failed to fetch users');
    }
    
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    // Get total items by status
    const { data: items, error: itemsError } = await supabase
      .from('lost_items')
      .select('status');
    
    if (itemsError) {
      throw new Error('Failed to fetch items');
    }
    
    const itemsByStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate derived stats
    const stats = {
      users: {
        total: users.length,
        students: usersByRole.student || 0,
        admins: usersByRole.admin || 0,
        directors: usersByRole.director || 0
      },
      items: {
        total: items.length,
        adminPending: itemsByStatus.admin_pending || 0,
        lost: itemsByStatus.lost || 0,
        found: itemsByStatus.found || 0,
        claimed: itemsByStatus.claimed || 0,
        returned: itemsByStatus.returned || 0
      },
      systemHealth: {
        databaseConnected: true,
        activeUsers: users.length,
        pendingApprovals: (itemsByStatus.admin_pending || 0) + (itemsByStatus.claimed || 0)
      }
    };
    
    const response = {
      success: true,
      stats,
      timestamp: new Date().toISOString()
    };

    // Cache for 5 minutes
    cache.set(cacheKey, response, CACHE_TTL.LONG);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch director stats', 500);
  }
}
