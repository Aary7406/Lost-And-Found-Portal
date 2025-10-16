import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// POST /api/cleanup/supabase - Cleanup old data or perform maintenance (admin only)
export async function POST(request) {
  try {
    const { action, days } = await request.json();
    const supabase = getSupabase();
    
    if (!action) {
      return createErrorResponse('Action is required', 400);
    }
    
    let results = {};
    
    switch (action) {
      case 'delete_old_returned':
        // Delete items that have been returned for more than X days
        const daysAgo = days || 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        const { data: deletedItems, error: deleteError } = await supabase
          .from('lost_items')
          .delete()
          .eq('status', 'returned')
          .lt('date_returned', cutoffDate.toISOString().split('T')[0])
          .select('id');
        
        if (deleteError) {
          throw new Error('Failed to delete old returned items');
        }
        
        results = {
          action: 'delete_old_returned',
          daysAgo,
          itemsDeleted: deletedItems?.length || 0
        };
        break;
        
      case 'archive_old_items':
        // Mark very old items as archived (could add an archived status)
        results = {
          action: 'archive_old_items',
          message: 'Archive functionality not yet implemented'
        };
        break;
        
      default:
        return createErrorResponse('Invalid action', 400);
    }
    
    return createSuccessResponse({
      message: 'Cleanup completed',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Cleanup failed', 500);
  }
}
