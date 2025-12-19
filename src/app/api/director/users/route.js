import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, hashPassword } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/director/users - Get all users for director management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    const supabase = getSupabase();
    
    let query = supabase
      .from('users')
      .select('id, username, email, first_name, last_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Database error fetching users:', error);
      return createErrorResponse(`Database error: ${error.message}`, 500);
    }
    
    // Return empty array if no users found instead of error
    return createSuccessResponse({
      users: users || [],
      total: users ? users.length : 0
    });
    
  } catch (error) {
    console.error('API Error in GET /api/director/users:', error);
    return createErrorResponse(error.message || 'Failed to fetch users', 500);
  }
}

// POST /api/director/users - Create a new user (admin or student)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      username,
      password,
      role
    } = body;
    
    // Validation
    if (!username || !password || !role) {
      return createErrorResponse('Missing required fields', 400);
    }
    
    if (!['student', 'admin', 'director'].includes(role)) {
      return createErrorResponse('Invalid role', 400);
    }
    
    const supabase = getSupabase();
    
    // Check for existing username
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);
    
    if (existingUser && existingUser.length > 0) {
      return createErrorResponse('Username already exists', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user with placeholder values for NOT NULL fields
    const placeholderEmail = `${username}@placeholder.local`;
    
    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        email: placeholderEmail,
        password: hashedPassword,
        first_name: username,
        last_name: '',
        role
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse(`Database error: ${error.message || 'Failed to create user'}`, 500);
    }
    
    return createSuccessResponse({
      message: 'User created successfully',
      user: newUser
    }, 201);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to create user', 500);
  }
}
