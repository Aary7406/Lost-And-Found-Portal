import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { hashPassword } from '../../../../../lib/supabase-auth';

// GET /api/admin/students - Get all students
export async function GET(request) {
  try {
    const supabase = getSupabase();
    
    const { data: students, error } = await supabase
      .from('users')
      .select('id, username, email, first_name, last_name, created_at, updated_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error fetching students:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      students: students || []
    });
    
  } catch (error) {
    console.error('API Error in GET /api/admin/students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/admin/students - Create a new student
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, email, first_name, last_name } = body;
    
    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabase();
    
    // Check for existing username
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);
    
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create student
    const { data: newStudent, error } = await supabase
      .from('users')
      .insert([{
        username,
        email: email || `${username}@placeholder.local`,
        password: hashedPassword,
        first_name: first_name || username,
        last_name: last_name || '',
        role: 'student'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: newStudent
    }, { status: 201 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
