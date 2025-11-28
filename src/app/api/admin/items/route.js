import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL, INVALIDATION_PATTERNS } from '../../../../../lib/cache';

// GET /api/admin/items - Get all items with filtering and sorting
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Check cache first
    const cacheKey = CACHE_KEYS.ADMIN_ITEMS(status, category, search);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Admin items');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Admin items - fetching from database');

    const supabase = getSupabase();
    
    // Build query with all item details
    let query = supabase
      .from('lost_items')
      .select(`
        id,
        name,
        description,
        category,
        location_lost,
        location_found,
        date_lost,
        date_found,
        date_returned,
        contact_info,
        status,
        notes,
        color,
        brand,
        image_url,
        reward_amount,
        owner_user_id,
        finder_user_id,
        reported_by_user_id,
        created_at,
        updated_at,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `);
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      // Search across multiple fields
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location_lost.ilike.%${search}%,location_found.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    
    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch items from database');
    }
    
    // Transform items for admin interface
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      locationLost: item.location_lost,
      locationFound: item.location_found,
      dateLost: item.date_lost,
      dateFound: item.date_found,
      dateReturned: item.date_returned,
      contactInfo: item.contact_info,
      status: item.status,
      notes: item.notes,
      color: item.color,
      brand: item.brand,
      imageUrl: item.image_url,
      rewardAmount: item.reward_amount,
      
      // User information
      owner: item.owner,
      finder: item.finder,
      reporter: item.reporter,
      
      // Timestamps
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      
      // Admin action flags
      canEdit: true,
      canDelete: true,
      canMarkAsFound: item.status === 'lost',
      canMarkAsLost: item.status === 'found',
      canMarkAsReturned: ['claimed', 'found'].includes(item.status),
      needsApproval: ['admin_pending', 'claimed'].includes(item.status),
      
      // Display helpers
      displayStatus: item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      daysOpen: Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24)),
      hasImage: !!item.image_url,
      hasReward: !!item.reward_amount && item.reward_amount > 0
    }));
    
    // Calculate statistics for the filtered view
    const stats = {
      total: transformedItems.length,
      byStatus: {
        admin_pending: transformedItems.filter(i => i.status === 'admin_pending').length,
        lost: transformedItems.filter(i => i.status === 'lost').length,
        found: transformedItems.filter(i => i.status === 'found').length,
        claimed: transformedItems.filter(i => i.status === 'claimed').length,
        returned: transformedItems.filter(i => i.status === 'returned').length
      },
      byCategory: transformedItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
      withReward: transformedItems.filter(i => i.hasReward).length,
      withImage: transformedItems.filter(i => i.hasImage).length,
      needingAction: transformedItems.filter(i => i.needsApproval).length
    };
    
    const response = {
      success: true,
      items: transformedItems,
      stats,
      total: transformedItems.length,
      filters: { status, category, search, sortBy, sortOrder }
    };

    // Cache the result for 2 minutes
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch items', 500);
  }
}
