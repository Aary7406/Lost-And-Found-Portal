import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/debug/auth - Debug authentication and user data
export async function GET(request) {
  try {
    const supabase = getSupabase();
    
    // Get all users (for debugging)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, first_name, last_name, student_id, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error('Failed to fetch users');
    }
    
    // Count by role
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      usersByRole: byRole,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        name: `${u.first_name} ${u.last_name}`,
        studentId: u.student_id,
        createdAt: u.created_at
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
