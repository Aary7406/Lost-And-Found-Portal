import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../../lib/supabase';
import { hashPassword } from '../../../../../../lib/supabase-auth';

// PUT /api/admin/students/[id] - Update a student
export async function PUT(request, { params }) {
  try {
    console.log('PUT /api/admin/students/[id] - params:', params);
    const { id } = await params;
    console.log('Student ID:', id);
    
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { username, password, email, first_name, last_name } = body;
    
    const supabase = getSupabase();
    
    const updateData = {
      username,
      email: email || `${username}@placeholder.local`,
      first_name: first_name || username,
      last_name: last_name || '',
      updated_at: new Date().toISOString()
    };
    
    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    const { data: updatedStudent, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'student')
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
      message: 'Student updated successfully',
      student: updatedStudent
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/students/[id] - Delete a student
export async function DELETE(request, { params }) {
  try {
    console.log('DELETE /api/admin/students/[id] - params:', params);
    const { id } = await params;
    console.log('Student ID:', id);
    
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'student');
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}
