// Database manager for Supabase operations
import { getSupabase } from './supabase';

class DatabaseManager {
  constructor() {
    this.supabase = null;
  }

  getClient() {
    if (!this.supabase) {
      this.supabase = getSupabase();
    }
    return this.supabase;
  }

  // User operations
  async getUser(userId) {
    const { data, error } = await this.getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username) {
    const { data, error } = await this.getClient()
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Item operations
  async getItems(filters = {}) {
    let query = this.getClient().from('lost_items').select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getItem(itemId) {
    const { data, error } = await this.getClient()
      .from('lost_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createItem(itemData) {
    const { data, error } = await this.getClient()
      .from('lost_items')
      .insert([itemData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateItem(itemId, updates) {
    const { data, error } = await this.getClient()
      .from('lost_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteItem(itemId) {
    const { error } = await this.getClient()
      .from('lost_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    return true;
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager();
export default dbManager;
