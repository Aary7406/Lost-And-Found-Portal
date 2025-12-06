import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Fetch student's lost item requests
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user identifier (id or username for backward compatibility)
    const userIdentifier = decoded.id || decoded.username;
    if (!userIdentifier) {
      console.error('No user identifier found in token:', decoded);
      return NextResponse.json(
        { success: false, error: 'Invalid user credentials' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    
    // Fetch items reported by this student
    // Try by id first, fallback to username
    let query = supabase
      .from('lost_items')
      .select('*');
    
    if (decoded.id) {
      query = query.eq('reported_by', decoded.id);
    } else {
      // For old tokens without id, we need to look up the user first
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('username', decoded.username)
        .eq('role', 'student')
        .single();
      
      if (!users) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      query = query.eq('reported_by', users.id);
    }
    
    const { data: requests, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new lost item request
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user identifier (id or username for backward compatibility)
    const userIdentifier = decoded.id || decoded.username;
    if (!userIdentifier) {
      console.error('No user identifier found in token:', decoded);
      return NextResponse.json(
        { success: false, error: 'Invalid user credentials' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { item_name, category, description, location_lost, date_lost } = body;

    // Validation
    if (!item_name || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    // Get the actual user ID if we only have username
    let userId = decoded.id;
    if (!userId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', decoded.username)
        .eq('role', 'student')
        .single();
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      userId = user.id;
    }

    // Create lost item request
    const { data: newRequest, error } = await supabase
      .from('lost_items')
      .insert({
        item_name,
        category,
        description,
        location_lost: location_lost || null,
        date_lost: date_lost || null,
        item_type: 'lost',
        status: 'unclaimed',
        reported_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lost item request submitted successfully',
      request: newRequest
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete student's own lost item request
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get user identifier
    const userIdentifier = decoded.id || decoded.username;
    if (!userIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Invalid user credentials' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    
    // Get the actual user ID if we only have username
    let userId = decoded.id;
    if (!userId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', decoded.username)
        .eq('role', 'student')
        .single();
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      userId = user.id;
    }

    // Verify ownership and delete
    const { data: item, error: fetchError } = await supabase
      .from('lost_items')
      .select('reported_by')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this item
    if (item.reported_by !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reports' },
        { status: 403 }
      );
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('lost_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
