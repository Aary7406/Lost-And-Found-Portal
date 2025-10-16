import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../lib/cache';

// POST /api/admin/create - Admin creates a new found item directly
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      location_found,
      date_found,
      contact_info,
      color,
      brand,
      image_url,
      finder_user_id
    } = body;
    
    // Validation
    if (!name || !description || !category || !location_found || !date_found) {
      return createErrorResponse('Missing required fields: name, description, category, location_found, date_found', 400);
    }
    
    const validCategories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Keys', 'Documents', 'Other'];
    if (!validCategories.includes(category)) {
      return createErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }
    
    const supabase = getSupabase();
    
    // Create the found item
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      category,
      location_found: location_found.trim(),
      date_found,
      contact_info: contact_info?.trim() || null,
      color: color?.trim() || null,
      brand: brand?.trim() || null,
      image_url: image_url?.trim() || null,
      finder_user_id: finder_user_id || null,
      status: 'found', // Admin-created items are automatically marked as found
      notes: 'Item added by administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newItem, error } = await supabase
      .from('lost_items')
      .insert([itemData])
      .select(`
        *,
        finder:finder_user_id(id, username, email, first_name, last_name, student_id)
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
      message: 'Found item created successfully',
      item: newItem
    }, 201);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to create item', 500);
  }
}
