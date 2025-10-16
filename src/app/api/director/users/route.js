import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/director/users - Get all users for director management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    const supabase = getSupabase();
    
    let query = supabase
      .from('users')
      .select('id, username, email, first_name, last_name, student_id, phone, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch users');
    }
    
    return createSuccessResponse({
      users,
      total: users.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch users', 500);
  }
}

// POST /api/director/users - Create a new user (admin or student)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      student_id,
      phone
    } = body;
    
    // Validation
    if (!username || !email || !password || !first_name || !last_name || !role) {
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
    
    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password, // In production, hash this
        first_name,
        last_name,
        role,
        student_id: student_id || null,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create user');
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
