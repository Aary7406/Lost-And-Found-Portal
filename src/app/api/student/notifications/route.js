import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../../../lib/cache';

// GET /api/student/notifications - Get student notifications
export async function GET(request) {
  try {
    console.log('🔔 Get notifications request started');
    
    // Verify authentication
    const authResult = verifyToken(request);
    if (!authResult.success) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authResult;
    console.log('✅ User authenticated:', user.username);

    // Check cache first
    const cacheKey = CACHE_KEYS.STUDENT_NOTIFICATIONS(user.id);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🔥 Cache HIT: Student notifications');
      return NextResponse.json(cached);
    }
    console.log('❄️ Cache MISS: Student notifications - fetching from database');

    // Mock notifications data
    const mockNotifications = [
      {
        id: 1,
        type: 'match_found',
        title: 'Potential Match Found',
        message: 'Your lost laptop might have been found. Check the found items list.',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'claim_approved',
        title: 'Claim Approved',
        message: 'Your claim for the water bottle has been approved. Pick it up from the office.',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: 3,
        type: 'new_item',
        title: 'New Item Available',
        message: 'A new iPhone has been added to the found items list.',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      }
    ];

    // Filter notifications to only show recent ones (last 7 days)
    const recentNotifications = mockNotifications.filter(notification => {
      const notificationDate = new Date(notification.created_at);
      const weekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
      return notificationDate > weekAgo;
    });

    console.log(`✅ Retrieved ${recentNotifications.length} notifications for user ${user.username}`);

    const response = {
      success: true,
      notifications: recentNotifications
    };

    // Cache the result
    cache.set(cacheKey, response, CACHE_TTL.SHORT);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
