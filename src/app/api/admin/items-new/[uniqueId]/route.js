import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../../lib/supabase';

// PUT /api/admin/items/[uniqueId] - Update item status
export async function PUT(request, { params }) {
  try {
    const { uniqueId } = params;
    const body = await request.json();
    const { status } = body;
    
    // Validation
    if (!status || !['unclaimed', 'claimed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "unclaimed" or "claimed"' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabase();
    
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Set claimed_at timestamp if claiming
    if (status === 'claimed') {
      updateData.claimed_at = new Date().toISOString();
    }
    
    const { data: updatedItem, error } = await supabase
      .from('lost_items')
      .update(updateData)
      .eq('unique_item_id', uniqueId)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item status updated successfully',
      item: updatedItem
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/items/[uniqueId] - Permanently delete item from database
export async function DELETE(request, { params }) {
  try {
    const { uniqueId } = params;
    const supabase = getSupabase();
    
    // Delete the item permanently (not soft delete)
    const { error } = await supabase
      .from('lost_items')
      .delete()
      .eq('unique_item_id', uniqueId);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item permanently deleted from database'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}
