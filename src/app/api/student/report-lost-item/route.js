import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../lib/cache';

// POST /api/student/report-lost-item - Students report lost items (creates admin_pending items)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      location_lost,
      date_lost,
      contact_info,
      color,
      brand,
      image_url,
      reward_amount,
      user_id
    } = body;
    
    // Validation
    if (!name || !description || !category || !location_lost || !date_lost || !user_id) {
      return createErrorResponse('Missing required fields: name, description, category, location_lost, date_lost, user_id', 400);
    }
    
    // Validate category
    const validCategories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Keys', 'Documents', 'Other'];
    if (!validCategories.includes(category)) {
      return createErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }
    
    // Validate date_lost is not in the future
    const lostDate = new Date(date_lost);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lostDate > today) {
      return createErrorResponse('Date lost cannot be in the future', 400);
    }
    
    // Validate reward_amount if provided
    if (reward_amount !== undefined && reward_amount !== null) {
      const amount = Number(reward_amount);
      if (isNaN(amount) || amount < 0) {
        return createErrorResponse('Reward amount must be a positive number', 400);
      }
    }
    
    const supabase = getSupabase();
    
    // Create the lost item report with admin_pending status
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      category,
      location_lost: location_lost.trim(),
      date_lost,
      contact_info: contact_info?.trim() || null,
      color: color?.trim() || null,
      brand: brand?.trim() || null,
      image_url: image_url?.trim() || null,
      reward_amount: reward_amount ? Number(reward_amount) : null,
      reported_by_user_id: user_id,
      status: 'admin_pending', // Requires admin approval
      notes: 'Lost item report submitted by student - awaiting admin approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newItem, error } = await supabase
      .from('lost_items')
      .insert([itemData])
      .select(`
        *,
        reporter:reported_by_user_id(id, username, email, first_name, last_name, student_id)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create lost item report');
    }
    
    // Invalidate related caches so admin sees the new pending report immediately
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    console.log('🗑️ Cache invalidated: Admin and student data after new lost item report');
    
    return createSuccessResponse({
      message: 'Lost item report submitted successfully! It will appear in your dashboard once approved by an administrator.',
      item: newItem,
      status: 'pending_approval'
    }, 201);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to report lost item', 500);
  }
}
