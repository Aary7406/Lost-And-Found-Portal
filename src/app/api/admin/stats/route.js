import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../../../lib/cache';

export async function GET(request) {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.ADMIN_STATS();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Admin stats');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Admin stats - fetching from database');

    const supabase = getSupabase();
    
    // Get dashboard statistics
    const [
      { count: totalStudents },
      { count: totalLostItems },
      { count: totalFoundItems },
      { count: totalReturned },
      { count: claimedItems },
      { count: pendingReports },
      { count: activeAdmins }
    ] = await Promise.all([
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('status', 'active'),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'lost'),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'found'),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'returned'),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'claimed'),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'admin_pending'),
      
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('status', 'active')
    ]);
    
    // Pending approvals = claimed items + pending reports (admin_pending)
    const pendingApprovals = (claimedItems || 0) + (pendingReports || 0);
    
    const response = {
      success: true,
      stats: {
        totalStudents: totalStudents || 0,
        totalLostItems: totalLostItems || 0,
        totalFoundItems: totalFoundItems || 0,
        totalReturned: totalReturned || 0,
        pendingApprovals: pendingApprovals,
        activeAdmins: activeAdmins || 0
      }
    };

    // Cache the result for 30 seconds to allow real-time updates on admin dashboard
    cache.set(cacheKey, response, CACHE_TTL.SHORT);
    
    return NextResponse.json(response);
    
  } catch (error) {
    return createErrorResponse(error.message || 'Failed to fetch statistics', 500);
  }
}
