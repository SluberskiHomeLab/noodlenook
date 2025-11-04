import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, FileText } from 'lucide-react';
import { search } from '../utils/api';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await search.query(searchQuery);
      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Search Wiki
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
              <SearchIcon 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)'
                }} 
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for pages..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  fontSize: '1.125rem',
                  borderRadius: '0.5rem',
                  border: '2px solid var(--border-color)',
                }}
              />
            </div>
          </form>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Searching...
          </div>
        )}

        {!loading && searched && (
          <>
            <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchParams.get('q')}"
            </div>

            {results.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                color: 'var(--text-secondary)'
              }}>
                <SearchIcon size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No results found</h3>
                <p>Try different keywords or browse all pages from the sidebar</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map(page => (
                  <Link key={page.id} to={`/page/${page.slug}`} style={{ textDecoration: 'none' }}>
                    <div 
                      className="card" 
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <FileText size={24} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                          }}>
                            {page.title}
                          </h3>
                          <p style={{ 
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {page.content.substring(0, 200)}...
                          </p>
                          <div style={{ 
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)'
                          }}>
                            By {page.author_name || 'Unknown'} • {new Date(page.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !searched && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <SearchIcon size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
            <p>Enter a search query to find wiki pages</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
