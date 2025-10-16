import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';

// GET /api/admin/students - Get all students with their activity stats
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const supabase = getSupabase();
    
    // Get all students
    let query = supabase
      .from('users')
      .select('id, username, email, first_name, last_name, student_id, phone, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%`);
    }
    
    const { data: students, error: studentsError } = await query;
    
    if (studentsError) {
      console.error('Database error:', studentsError);
      throw new Error('Failed to fetch students');
    }
    
    // Get item statistics for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        // Count items reported by this student
        const { data: reportedItems } = await supabase
          .from('lost_items')
          .select('id')
          .eq('reported_by_user_id', student.id);
        
        // Count items found by this student
        const { data: foundItems } = await supabase
          .from('lost_items')
          .select('id')
          .eq('finder_user_id', student.id);
        
        // Count items claimed by this student
        const { data: claimedItems } = await supabase
          .from('lost_items')
          .select('id')
          .eq('owner_user_id', student.id);
        
        return {
          ...student,
          stats: {
            reportedItems: reportedItems?.length || 0,
            foundItems: foundItems?.length || 0,
            claimedItems: claimedItems?.length || 0,
            totalActivity: (reportedItems?.length || 0) + (foundItems?.length || 0) + (claimedItems?.length || 0)
          }
        };
      })
    );
    
    return createSuccessResponse({
      students: studentsWithStats,
      total: studentsWithStats.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch students', 500);
  }
}
