import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, hashPassword } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/student/signup - Student registration
export async function POST(request) {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name
    } = await request.json();
    
    // Validation
    if (!username || !email || !password || !first_name || !last_name) {
      return createErrorResponse('Missing required fields: username, email, password, first_name, last_name', 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400);
    }
    
    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 characters long', 400);
    }
    
    const supabase = getSupabase();
    
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);
    
    if (existingUsername && existingUsername.length > 0) {
      return createErrorResponse('Username already exists', 409);
    }
    
    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);
    
    if (existingEmail && existingEmail.length > 0) {
      return createErrorResponse('Email already exists', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const userData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role: 'student'
    };
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create user account');
    }
    
    // Create JWT token for automatic login after signup
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        student_id: newUser.student_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    const response = createSuccessResponse({
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
      },
      token
    }, 201);
    
    // Set token as HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Registration failed', 500);
  }
}
