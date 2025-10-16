'use client';

import { useState } from 'react';
import SearchItems from '../../components/SearchItems/SearchItems';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Search Lost & Found Items</h1>
      <SearchItems onResults={setSearchResults} onLoading={setLoading} />
      
      {loading && <p>Searching...</p>}
      
      <div style={{ marginTop: '40px' }}>
        {searchResults.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {searchResults.map(item => (
              <div key={item.id} style={{ 
                border: '1px solid #ccc', 
                borderRadius: '12px', 
                padding: '20px',
                backgroundColor: '#fff'
              }}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  borderRadius: '20px',
                  backgroundColor: item.status === 'lost' ? '#ff6b6b' : '#51cf66',
                  color: '#fff',
                  fontSize: '12px'
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No results found. Try searching for an item.</p>
        )}
      </div>
    </div>
  );
}
