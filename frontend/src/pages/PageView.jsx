import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Edit, Trash2, Clock, User } from 'lucide-react';
import { pages } from '../utils/api';
import { useApp } from '../App';

function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useApp();

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await pages.getBySlug(slug);
      setPage(response.data);
    } catch (err) {
      setError('Page not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      await pages.delete(slug);
      navigate('/');
    } catch (err) {
      alert('Failed to delete page');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading page...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <button className="btn-primary">Go to Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              {page.title}
            </h1>
            
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} />
                <span>{page.author_name || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {user && (user.role === 'editor' || user.role === 'admin') && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/edit/${slug}`}>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  <Edit size={18} />
                  Edit
                </button>
              </Link>
              {user.role === 'admin' && (
                <button 
                  onClick={handleDelete}
                  className="btn-danger" 
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="markdown-content">
          {page.content_type === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <ReactMarkdown>{page.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageView;
