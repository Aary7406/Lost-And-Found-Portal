import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../../lib/cache';

// GET /api/student/claims/[id] - Get a specific claim by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { data: claim, error } = await supabase
      .from('lost_items')
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name, student_id),
        finder:finder_user_id(id, username, email, first_name, last_name, student_id),
        reporter:reported_by_user_id(id, username, email, first_name, last_name, student_id)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch claim');
    }
    
    if (!claim) {
      return createErrorResponse('Claim not found', 404);
    }
    
    return createSuccessResponse({ claim });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch claim', 500);
  }
}

// PATCH /api/student/claims/[id] - Update a claim (cancel, etc.)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...updates } = body;
    const supabase = getSupabase();
    
    let updateData = {};
    
    // Handle special actions
    if (action === 'cancel') {
      // Revert claim back to found status
      updateData = {
        status: 'found',
        owner_user_id: null,
        notes: updates.notes || 'Claim cancelled by student',
        updated_at: new Date().toISOString()
      };
    } else {
      // Regular field updates
      updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
    
    // Perform the update
    const { data: updatedClaim, error } = await supabase
      .from('lost_items')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name, student_id),
        finder:finder_user_id(id, username, email, first_name, last_name, student_id),
        reporter:reported_by_user_id(id, username, email, first_name, last_name, student_id)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update claim');
    }
    
    // Invalidate related caches after successful update
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    console.log(`🗑️ Cache invalidated: Admin and student data after claim update (action: ${action || 'update'})`);
    
    return createSuccessResponse({ 
      message: 'Claim updated successfully',
      claim: updatedClaim,
      action: action || 'update'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to update claim', 500);
  }
}
