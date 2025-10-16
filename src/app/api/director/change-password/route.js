import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// POST /api/director/change-password - Change director's own password
export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();
    
    if (!userId || !currentPassword || !newPassword) {
      return createErrorResponse('Missing required fields', 400);
    }
    
    if (newPassword.length < 6) {
      return createErrorResponse('New password must be at least 6 characters', 400);
    }
    
    const supabase = getSupabase();
    
    // Verify current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError || !user) {
      throw new Error('User not found');
    }
    
    // Check current password (in production use bcrypt)
    if (user.password !== currentPassword) {
      return createErrorResponse('Current password is incorrect', 401);
    }
    
    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: newPassword, // In production, hash this
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      throw new Error('Failed to update password');
    }
    
    return createSuccessResponse({
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to change password', 500);
  }
}
