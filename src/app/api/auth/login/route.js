import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { verifyPassword, createToken, setAuthCookie } from '../../../../../lib/supabase-auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Query user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password, role, email, first_name, last_name')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

    setAuthCookie(response, token);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
