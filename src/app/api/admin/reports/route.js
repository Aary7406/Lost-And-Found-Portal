import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../../../lib/cache';

// GET /api/admin/reports - Get all pending lost item reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'admin_pending';
    
    // Check cache first
    const cacheKey = CACHE_KEYS.ADMIN_REPORTS(status);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Admin reports');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Admin reports - fetching from database');

    const supabase = getSupabase();
    
    // Get items with admin_pending status (reports waiting for admin decision)
    let query = supabase
      .from('lost_items')
      .select(`
        *,
        owner:owner_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: reports, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch reports from database');
    }
    
    // Transform data for admin interface
    const transformedReports = reports.map(report => ({
      id: report.id,
      itemName: report.name,
      description: report.description,
      category: report.category,
      lastSeenLocation: report.location_lost,
      lastSeenDate: report.date_lost,
      contactInfo: report.contact_info,
      status: report.status,
      notes: report.notes,
      reportedBy: report.reporter,
      owner: report.owner,
      submittedAt: report.created_at,
      updatedAt: report.updated_at,
      // Indicate if this item was not found in database (new report)
      isNewReport: report.status === 'admin_pending',
      // Extract urgency from notes if available
      urgency: extractUrgencyFromNotes(report.notes)
    }));
    
    const response = {
      success: true,
      reports: transformedReports || [],
      total: transformedReports.length,
      pendingCount: transformedReports.filter(r => r.status === 'admin_pending').length
    };

    // Cache the result for 2 minutes
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch reports', 500);
  }
}

// Helper function to extract urgency from notes
function extractUrgencyFromNotes(notes) {
  if (!notes) return 'medium';
  const urgencyMatch = notes.match(/Urgency: (low|medium|high|critical)/i);
  return urgencyMatch ? urgencyMatch[1].toLowerCase() : 'medium';
}
