import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import { cache, INVALIDATION_PATTERNS } from '../../../../../../lib/cache';

// GET /api/admin/items/[id] - Get a specific item by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { data: item, error } = await supabase
      .from('lost_items')
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `)
      .eq('id', itemId)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch item');
    }
    
    if (!item) {
      return createErrorResponse('Item not found', 404);
    }
    
    return createSuccessResponse({ item });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch item', 500);
  }
}

// PATCH /api/admin/items/[id] - Update an item (including Lost/Found status toggle)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...updates } = body;
    const supabase = getSupabase();
    
    let updateData = {};
    
    // Handle special actions (Lost/Found status toggle)
    if (action === 'mark_as_lost') {
      updateData = {
        status: 'lost',
        date_found: null,
        location_found: null,
        finder_user_id: null,
        notes: updates.notes || 'Marked as Lost by administrator',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'mark_as_found') {
      updateData = {
        status: 'found',
        date_found: updates.date_found || new Date().toISOString().split('T')[0],
        location_found: updates.location_found || 'Admin office',
        notes: updates.notes || 'Marked as Found by administrator',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'approve_report') {
      // Approve an admin_pending report -> make it lost
      updateData = {
        status: 'lost',
        notes: updates.notes || 'Report approved by administrator',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'reject_report') {
      // Reject an admin_pending report -> delete or mark as rejected
      const { error: deleteError } = await supabase
        .from('lost_items')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw new Error('Failed to reject report');
      }
      
      // Invalidate all related caches
      cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
      cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
      console.log('🗑️ Cache invalidated: Admin and student data after report rejection');
      
      return createSuccessResponse({ 
        message: 'Report rejected and deleted successfully',
        deleted: true 
      });
    } else if (action === 'mark_as_returned') {
      updateData = {
        status: 'returned',
        date_returned: updates.date_returned || new Date().toISOString().split('T')[0],
        notes: updates.notes || 'Marked as returned by administrator',
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
    const { data: updatedItem, error } = await supabase
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
      throw new Error('Failed to update item');
    }
    
    // Invalidate related caches after successful update
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    console.log(`🗑️ Cache invalidated: Admin and student data after item update (action: ${action || 'update'})`);
    
    return createSuccessResponse({ 
      message: 'Item updated successfully',
      item: updatedItem,
      action: action || 'update'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to update item', 500);
  }
}

// DELETE /api/admin/items/[id] - Delete an item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('lost_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete item');
    }
    
    // Invalidate related caches after successful deletion
    cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
    cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
    console.log('🗑️ Cache invalidated: Admin and student data after item deletion');
    
    return createSuccessResponse({ 
      message: 'Item deleted successfully',
      deleted: true 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to delete item', 500);
  }
}
