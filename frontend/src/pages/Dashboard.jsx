import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Clock, Plus, Search as SearchIcon } from 'lucide-react';
import { pages } from '../utils/api';
import { useApp } from '../App';

function Dashboard() {
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await pages.getAll();
      setRecentPages(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Welcome to NoodleNook
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)',
          marginBottom: '2rem'
        }}>
          Your modern wiki and knowledge base platform
        </p>

        {!user && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '2px solid var(--primary-color)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Get Started</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Sign up to create and manage your wiki pages, or login if you already have an account.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/register">
                <button className="btn-primary">Register Now</button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary">Login</button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
          color: 'white',
          cursor: 'pointer',
        }}>
          <Link to="/search" style={{ color: 'white', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <SearchIcon size={32} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Search</h3>
            </div>
            <p style={{ opacity: 0.9 }}>
              Powerful full-text search across all wiki pages
            </p>
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FileText size={32} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {recentPages.length}
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Total wiki pages available
          </p>
        </div>

        {user && (user.role === 'editor' || user.role === 'admin') && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--success-color) 0%, #059669 100%)',
            color: 'white',
            cursor: 'pointer',
          }}>
            <Link to="/new" style={{ color: 'white', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Plus size={32} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create Page</h3>
              </div>
              <p style={{ opacity: 0.9 }}>
                Start writing a new wiki page
              </p>
            </Link>
          </div>
        )}
      </div>

      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Clock size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Recent Pages
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading pages...
          </div>
        ) : recentPages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No pages yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {user && (user.role === 'editor' || user.role === 'admin')
                ? 'Be the first to create a wiki page!'
                : 'Check back later for new content.'
              }
            </p>
            {user && (user.role === 'editor' || user.role === 'admin') && (
              <Link to="/new">
                <button className="btn-primary">
                  <Plus size={18} />
                  Create First Page
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem'
          }}>
            {recentPages.map(page => (
              <Link key={page.id} to={`/page/${page.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)'
                  }}>
                    {page.title}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {page.content?.substring(0, 150) || 'No content'}...
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span>By {page.author_name || 'Unknown'}</span>
                    <span>{new Date(page.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
