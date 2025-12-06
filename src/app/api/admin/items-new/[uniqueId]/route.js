import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../../lib/supabase';

// PUT /api/admin/items/[uniqueId] - Update item status or type
export async function PUT(request, { params }) {
  try {
    const { uniqueId } = await params;
    const body = await request.json();
    const { status, item_type } = body;
    
    console.log('PUT request - uniqueId:', uniqueId, 'status:', status, 'item_type:', item_type);
    
    const supabase = getSupabase();
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    // Update status if provided
    if (status) {
      if (!['unclaimed', 'claimed'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be "unclaimed" or "claimed"' },
          { status: 400 }
        );
      }
      updateData.status = status;
      
      // Set claimed_at timestamp if claiming
      if (status === 'claimed') {
        updateData.claimed_at = new Date().toISOString();
      }
    }
    
    // Update item_type if provided (admin marking lost item as found)
    if (item_type) {
      if (!['lost', 'found'].includes(item_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid item_type. Must be "lost" or "found"' },
          { status: 400 }
        );
      }
      updateData.item_type = item_type;
    }
    
    console.log('Updating item with unique_item_id:', uniqueId, 'with data:', updateData);
    
    const { data: updatedItem, error } = await supabase
      .from('lost_items')
      .update(updateData)
      .eq('unique_item_id', uniqueId)
      .select();
    
    console.log('Update result - data:', updatedItem, 'error:', error);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!updatedItem || updatedItem.length === 0) {
      return NextResponse.json(
        { success: false, error: `Item not found with unique_item_id: ${uniqueId}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item status updated successfully',
      item: updatedItem[0]
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
    const { uniqueId } = await params;
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
