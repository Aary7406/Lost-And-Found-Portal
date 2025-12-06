import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { verifyToken } from '../../../../../lib/supabase-auth';

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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    
    // Fetch items reported by this student
    const { data: requests, error } = await supabase
      .from('lost_items')
      .select('*')
      .eq('reported_by', decoded.userId)
      .eq('item_type', 'lost')
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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
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
        reported_by: decoded.userId,
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
