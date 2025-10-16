'use client';

import { useState } from 'react';

export default function SearchItems({ onResults, onLoading }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearch = async (e) => {
    e.preventDefault();
    onLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/items?search=${query}&category=${category}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      
      if (data.success) {
        onResults(data.items);
      }
    } catch (error) {
      console.error('Search error:', error);
      onResults([]);
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for items..."
        style={{
          flex: 1,
          padding: '12px 20px',
          border: '2px solid #cba6f7',
          borderRadius: '12px',
          fontSize: '16px',
          backgroundColor: '#1e1e2e',
          color: '#cdd6f4'
        }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: '12px 20px',
          border: '2px solid #cba6f7',
          borderRadius: '12px',
          fontSize: '16px',
          backgroundColor: '#1e1e2e',
          color: '#cdd6f4'
        }}
      >
        <option value="all">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Accessories">Accessories</option>
        <option value="Books">Books</option>
        <option value="Keys">Keys</option>
        <option value="Documents">Documents</option>
        <option value="Other">Other</option>
      </select>
      <button
        type="submit"
        style={{
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #cba6f7 0%, #89b4fa 100%)',
          color: '#11111b',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Search
      </button>
    </form>
  );
}
