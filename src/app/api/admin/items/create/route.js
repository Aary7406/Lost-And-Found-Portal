import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../../lib/cache';

// POST /api/admin/items/create - Admin creates a new item (found or lost)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      location_lost,
      location_found,
      date_lost,
      date_found,
      contact_info,
      color,
      brand,
      image_url,
      reward_amount,
      status,
      notes,
      owner_user_id,
      finder_user_id
    } = body;
    
    // Validation
    if (!name || !description || !category || !status) {
      return createErrorResponse('Missing required fields: name, description, category, status', 400);
    }
    
    const validStatuses = ['lost', 'found', 'claimed', 'returned'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }
    
    const validCategories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Keys', 'Documents', 'Other'];
    if (!validCategories.includes(category)) {
      return createErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }
    
    const supabase = getSupabase();
    
    // Create the item
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      category,
      location_lost: location_lost?.trim() || null,
      location_found: location_found?.trim() || null,
      date_lost: date_lost || null,
      date_found: date_found || null,
      contact_info: contact_info?.trim() || null,
      color: color?.trim() || null,
      brand: brand?.trim() || null,
      image_url: image_url?.trim() || null,
      reward_amount: reward_amount ? Number(reward_amount) : null,
      status,
      notes: notes?.trim() || 'Item added by administrator',
      owner_user_id: owner_user_id || null,
      finder_user_id: finder_user_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newItem, error } = await supabase
      .from('lost_items')
      .insert([itemData])
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create item');
    }
    
    // Invalidate related caches
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    console.log('🗑️ Cache invalidated: Admin and student data after new item creation');
    
    return createSuccessResponse({
      message: 'Item created successfully',
      item: newItem
    }, 201);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to create item', 500);
  }
}
