import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// GET /api/admin/users/[userId] - Get a specific user by ID
export async function GET(request, { params }) {
  try {
    const { userId } = params;
    const supabase = getSupabase();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch user');
    }
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    
    // Get user's activity stats
    const { data: reportedItems } = await supabase
      .from('lost_items')
      .select('id')
      .eq('reported_by_user_id', userId);
    
    const { data: foundItems } = await supabase
      .from('lost_items')
      .select('id')
      .eq('finder_user_id', userId);
    
    const { data: claimedItems } = await supabase
      .from('lost_items')
      .select('id')
      .eq('owner_user_id', userId);
    
    return createSuccessResponse({
      user: {
        ...userWithoutPassword,
        stats: {
          reportedItems: reportedItems?.length || 0,
          foundItems: foundItems?.length || 0,
          claimedItems: claimedItems?.length || 0
        }
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch user', 500);
  }
}

// PATCH /api/admin/users/[userId] - Update a user
export async function PATCH(request, { params }) {
  try {
    const { userId } = params;
    const updates = await request.json();
    const supabase = getSupabase();
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.created_at;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update user');
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = updatedUser;
    
    return createSuccessResponse({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to update user', 500);
  }
}

// DELETE /api/admin/users/[userId] - Delete a user
export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete user');
    }
    
    return createSuccessResponse({
      message: 'User deleted successfully',
      deleted: true
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to delete user', 500);
  }
}
