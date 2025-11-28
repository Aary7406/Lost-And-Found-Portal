import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../../lib/cache';

// GET /api/admin/claims/[id] - Get a specific claim by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { data: claim, error } = await supabase
      .from('lost_items')
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `)
      .eq('id', claimId)
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

// PATCH /api/admin/claims/[id] - Admin updates a claim (approve, reject, etc.)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...updates } = body;
    const supabase = getSupabase();
    
    let updateData = {};
    
    // Handle special admin actions
    if (action === 'approve_report') {
      updateData = {
        status: 'lost',
        notes: updates.notes || 'Lost item report approved by administrator',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'approve_claim') {
      updateData = {
        status: 'returned',
        date_returned: new Date().toISOString().split('T')[0],
        notes: updates.notes || 'Claim approved and item returned by administrator',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'reject') {
      const { data: currentClaim } = await supabase
        .from('lost_items')
        .select('status, date_found')
        .eq('id', id)
        .single();
      
      const revertedStatus = currentClaim?.date_found ? 'found' : 'lost';
      updateData = {
        status: revertedStatus,
        owner_user_id: null,
        notes: updates.notes || 'Claim rejected by administrator',
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
        owner:owner_user_id(id, username, email, first_name, last_name, student_id, phone),
        finder:finder_user_id(id, username, email, first_name, last_name, student_id, phone),
        reporter:reported_by_user_id(id, username, email, first_name, last_name, student_id, phone)
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
