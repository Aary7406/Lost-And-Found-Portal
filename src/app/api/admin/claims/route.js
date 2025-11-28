import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL, INVALIDATION_PATTERNS } from '../../../../../lib/cache';

// GET /api/admin/claims - Get all student claims for admin review
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    
    // Check cache first
    const cacheKey = CACHE_KEYS.ADMIN_CLAIMS(status, studentId);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Admin claims');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Admin claims - fetching from database');

    const supabase = getSupabase();
    
    // Get all items that have been claimed or reported by students
    let query = supabase
      .from('lost_items')
      .select(`
        id,
        name,
        description,
        category,
        location_lost,
        location_found,
        date_lost,
        date_found,
        date_returned,
        contact_info,
        status,
        notes,
        color,
        brand,
        image_url,
        reward_amount,
        owner_user_id,
        finder_user_id,
        reported_by_user_id,
        created_at,
        updated_at,
        owner:owner_user_id(id, username, email, first_name, last_name),
        finder:finder_user_id(id, username, email, first_name, last_name),
        reporter:reported_by_user_id(id, username, email, first_name, last_name)
      `)
      .order('updated_at', { ascending: false });
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Filter by specific student if provided
    if (studentId) {
      query = query.or(`owner_user_id.eq.${studentId},reported_by_user_id.eq.${studentId},finder_user_id.eq.${studentId}`);
    }
    
    const { data: claims, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch claims from database');
    }
    
    // Transform and categorize claims for admin interface
    const transformedClaims = claims.map(claim => {
      // Determine the claim type and primary student involved
      let claimType = 'unknown';
      let primaryStudent = null;
      let actionRequired = false;
      
      if (claim.status === 'admin_pending') {
        claimType = 'lost_item_report';
        primaryStudent = claim.reporter;
        actionRequired = true;
      } else if (claim.status === 'claimed') {
        claimType = 'claim_request';
        primaryStudent = claim.finder || claim.owner;
        actionRequired = true;
      } else if (claim.status === 'lost' && claim.reported_by_user_id) {
        claimType = 'approved_lost_item';
        primaryStudent = claim.reporter;
        actionRequired = false;
      } else if (claim.status === 'found') {
        claimType = 'found_item';
        primaryStudent = claim.finder;
        actionRequired = false;
      } else if (claim.status === 'returned') {
        claimType = 'completed';
        primaryStudent = claim.owner;
        actionRequired = false;
      }
      
      return {
        id: claim.id,
        itemName: claim.name,
        description: claim.description,
        category: claim.category,
        location: claim.location_lost || claim.location_found,
        lastSeenLocation: claim.location_lost,
        foundLocation: claim.location_found,
        lastSeenDate: claim.date_lost,
        foundDate: claim.date_found,
        returnedDate: claim.date_returned,
        contactInfo: claim.contact_info,
        status: claim.status,
        notes: claim.notes,
        color: claim.color,
        brand: claim.brand,
        imageUrl: claim.image_url,
        rewardAmount: claim.reward_amount,
        
        // Claim categorization for admin
        claimType,
        actionRequired,
        primaryStudent,
        
        // All involved parties
        owner: claim.owner,
        finder: claim.finder,
        reporter: claim.reporter,
        
        // Timestamps
        submittedAt: claim.created_at,
        lastUpdated: claim.updated_at,
        
        // Admin action context
        adminContext: {
          isNewReport: claim.status === 'admin_pending',
          needsApproval: ['claimed', 'admin_pending'].includes(claim.status),
          canMarkAsFound: claim.status === 'lost',
          canMarkAsReturned: claim.status === 'claimed',
          hasMultipleParties: [claim.owner, claim.finder, claim.reporter].filter(Boolean).length > 1
        }
      };
    });
    
    // Get summary statistics for admin dashboard
    const stats = {
      total: transformedClaims.length,
      pendingReports: transformedClaims.filter(c => c.status === 'admin_pending').length,
      pendingClaims: transformedClaims.filter(c => c.status === 'claimed').length,
      lostItems: transformedClaims.filter(c => c.status === 'lost').length,
      foundItems: transformedClaims.filter(c => c.status === 'found').length,
      completedReturns: transformedClaims.filter(c => c.status === 'returned').length,
      actionRequired: transformedClaims.filter(c => c.actionRequired).length
    };
    
    const response = {
      success: true,
      claims: transformedClaims,
      stats,
      total: transformedClaims.length
    };

    // Cache the result for 2 minutes
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to fetch claims', 500);
  }
}

// POST /api/admin/claims - Bulk actions on claims (approve multiple, etc.)
export async function POST(request) {
  try {
    const { action, claimIds, reason } = await request.json();
    const supabase = getSupabase();
    
    if (!action || !claimIds || !Array.isArray(claimIds)) {
      return createErrorResponse('Action and claim IDs are required', 400);
    }
    
    let updateData = {};
    let results = [];
    
    for (const claimId of claimIds) {
      try {
        // Get current claim to determine appropriate action
        const { data: currentClaim } = await supabase
          .from('lost_items')
          .select('*')
          .eq('id', claimId)
          .single();
        
        if (!currentClaim) {
          results.push({ id: claimId, success: false, error: 'Claim not found' });
          continue;
        }
        
        // Determine update based on action and current status
        switch (action) {
          case 'approve_reports':
            if (currentClaim.status === 'admin_pending') {
              updateData = {
                status: 'lost',
                notes: `Admin approved lost item report: ${reason || 'Approved by administrator'}`,
                updated_at: new Date().toISOString()
              };
            }
            break;
            
          case 'approve_claims':
            if (currentClaim.status === 'claimed') {
              updateData = {
                status: 'returned',
                date_returned: new Date().toISOString().split('T')[0],
                notes: `Claim approved and item returned: ${reason || 'Approved by administrator'}`,
                updated_at: new Date().toISOString()
              };
            }
            break;
            
          case 'reject':
            const revertedStatus = currentClaim.date_found ? 'found' : 'lost';
            updateData = {
              status: revertedStatus,
              notes: `Rejected by admin: ${reason || 'Rejected by administrator'}`,
              updated_at: new Date().toISOString()
            };
            break;
            
          default:
            results.push({ id: claimId, success: false, error: 'Invalid action' });
            continue;
        }
        
        // Update the claim
        const { error: updateError } = await supabase
          .from('lost_items')
          .update(updateData)
          .eq('id', claimId);
        
        if (updateError) {
          results.push({ id: claimId, success: false, error: updateError.message });
        } else {
          results.push({ id: claimId, success: true });
        }
        
      } catch (error) {
        results.push({ id: claimId, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    // Invalidate related caches after successful updates
    if (successCount > 0) {
      cache.invalidatePattern(INVALIDATION_PATTERNS.ADMIN_DATA);
      cache.invalidatePattern(INVALIDATION_PATTERNS.STUDENT_DATA);
      console.log('🗑️ Cache invalidated: Admin and student data after bulk claim action');
    }
    
    return createSuccessResponse({
      message: `Bulk action completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: { successful: successCount, failed: failureCount }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to process bulk action', 500);
  }
}
