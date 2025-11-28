import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/supabase-auth.js';
import { getSupabase } from '../../../../../lib/supabase.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../../../lib/cache';

// GET /api/student/stats - Get student dashboard statistics
export async function GET(request) {
  try {
    console.log('📊 Student stats request started');
    
    // Verify authentication
    const authResult = verifyToken(request);
    if (!authResult.success) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authResult;
    console.log('✅ User authenticated:', user.username);

    // Check cache first
    const cacheKey = CACHE_KEYS.STUDENT_STATS(user.id);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Student stats');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Student stats - fetching from database');

    // Initialize Supabase
    const supabase = getSupabase();

    // Get statistics for this student
    const [
      { count: totalLostItems },
      { count: totalFoundItems },
      { count: myReports },
      { count: myClaims }
    ] = await Promise.all([
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
        .eq('reported_by_user_id', user.id),
      
      supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true })
        .eq('finder_user_id', user.id)
        .eq('status', 'claimed')
    ]);

    console.log(`✅ Stats retrieved for user ${user.username}`);

    const response = {
      success: true,
      stats: {
        totalLostItems: totalLostItems || 0,
        totalFoundItems: totalFoundItems || 0,
        myReports: myReports || 0,
        myClaims: myClaims || 0
      }
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, CACHE_TTL.LONG);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in student stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
