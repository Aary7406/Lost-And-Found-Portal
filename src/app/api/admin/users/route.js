import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/admin/users - Get all users for admin management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    const supabase = getSupabase();
    
    let query = supabase
      .from('users')
      .select('id, username, email, first_name, last_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch users');
    }
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return createSuccessResponse({
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch users', 500);
  }
}
