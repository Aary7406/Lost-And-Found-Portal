import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth.js';
import { getSupabase } from '../../../../../lib/supabase.js';
import { cache, CACHE_KEYS, CACHE_TTL, INVALIDATION_PATTERNS } from '../../../../../lib/cache';

// GET /api/student/claims - Get student's claims
export async function GET(request) {
  try {
    console.log('📋 Student claims request started');
    
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
    const cacheKey = CACHE_KEYS.STUDENT_CLAIMS(user.id, 'all');
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Student claims');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Student claims - fetching from database');

    // Initialize Supabase
    const supabase = getSupabase();

    // Get claims for this student
    const { data: claims, error } = await supabase
      .from('lost_items')
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `)
      .or(`owner_user_id.eq.${user.id},finder_user_id.eq.${user.id},reported_by_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching claims:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch claims' },
        { status: 500 }
      );
    }

    console.log(`✅ Retrieved ${claims.length} claims for user ${user.username}`);

    const response = {
      success: true,
      claims: claims || []
    };

    // Cache the result for 2 minutes
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in student claims:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/student/claims - Create new claim
export async function POST(request) {
  try {
    console.log('📝 Create claim request started');
    
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
    const body = await request.json();
    
    console.log('✅ User authenticated:', user.username);
    console.log('📝 Claim data:', body);

    // Initialize Supabase
    const supabase = getSupabase();

    // Create the claim
    const { data, error } = await supabase
      .from('lost_items')
      .update({
        status: 'claimed',
        finder_user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.itemId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating claim:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create claim' },
        { status: 500 }
      );
    }

    // Invalidate related caches
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    console.log('🗑️ Cache invalidated: Student and admin data after new claim');

    console.log('✅ Claim created successfully');

    return NextResponse.json({
      success: true,
      claim: data
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in create claim:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
