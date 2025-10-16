import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// GET /api/director/users/[id] - Get a specific user
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
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
    
    return createSuccessResponse({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch user', 500);
  }
}

// PATCH /api/director/users/[id] - Update a user
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
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
      .eq('id', id)
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

// DELETE /api/director/users/[id] - Delete a user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
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
