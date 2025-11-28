import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, hashPassword } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// POST /api/setup/director - Initial director account setup
export async function POST(request) {
  try {
    const {
      username,
      password
    } = await request.json();
    
    // Validation
    if (!username || !password) {
      return createErrorResponse('Username and password are required', 400);
    }
    
    const supabase = getSupabase();
    
    // Check if a director already exists
    const { data: existingDirectors } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'director');
    
    if (existingDirectors && existingDirectors.length > 0) {
      return createErrorResponse('A director account already exists. Contact the existing director to create additional accounts.', 409);
    }
    
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);
    
    if (existingUsername && existingUsername.length > 0) {
      return createErrorResponse('Username already exists', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create director account
    const { data: newDirector, error } = await supabase
      .from('users')
      .insert([{
        username: username.trim(),
        email: `${username.trim()}@director.local`,
        password: hashedPassword,
        first_name: 'Director',
        last_name: 'Admin',
        role: 'director'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create director account');
    }
    
    // Don't return password
    const { password: _, ...directorWithoutPassword } = newDirector;
    
    return createSuccessResponse({
      message: 'Director account created successfully! You can now log in.',
      director: directorWithoutPassword
    }, 201);
    
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return createErrorResponse(error.message || 'Failed to setup director account', 500);
  }
}
