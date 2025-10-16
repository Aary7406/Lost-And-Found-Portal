import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// POST /api/setup/director - Initial director account setup
export async function POST(request) {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      setup_key
    } = await request.json();
    
    // Validation
    if (!username || !email || !password || !first_name || !last_name) {
      return createErrorResponse('Missing required fields', 400);
    }
    
    // Check setup key (in production, use a secure setup key from environment)
    const SETUP_KEY = process.env.DIRECTOR_SETUP_KEY || 'setup-director-2024';
    if (setup_key !== SETUP_KEY) {
      return createErrorResponse('Invalid setup key', 403);
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
    
    // Create director account
    const { data: newDirector, error } = await supabase
      .from('users')
      .insert([{
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password, // In production, hash this with bcrypt
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'director',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
    return createErrorResponse(error.message || 'Failed to setup director account', 500);
  }
}
