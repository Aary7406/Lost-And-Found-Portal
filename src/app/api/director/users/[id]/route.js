import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// GET /api/director/users/[id] - Get a specific user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
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
    console.log('PATCH /api/director/users/[id] - Starting');
    const { id } = await params;
    console.log('User ID:', id);
    
    const updates = await request.json();
    console.log('Updates received:', updates);
    
    const supabase = getSupabase();
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.created_at;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    console.log('Final updates to apply:', updates);
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Database response - data:', updatedUser, 'error:', error);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = updatedUser;
    
    console.log('Sending success response');
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('API Error in PATCH:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/director/users/[id] - Delete a user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
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
