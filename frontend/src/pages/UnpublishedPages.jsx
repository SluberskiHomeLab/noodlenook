import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { pages as pagesApi } from '../utils/api';
import { FileQuestion, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

function UnpublishedPages() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [unpublishedPages, setUnpublishedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadUnpublishedPages();
  }, []);

  const loadUnpublishedPages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pagesApi.getUnpublished();
      setUnpublishedPages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load unpublished pages');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (slug) => {
    if (!window.confirm('Are you sure you want to publish this page?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await pagesApi.publish(slug);
      setSuccess('Page published successfully');
      await loadUnpublishedPages();
      setTimeout(() => setSuccess(''), 3000);
      
      // Optionally navigate to the page
      setTimeout(() => navigate(`/page/${slug}`), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish page');
    }
  };

  const handleReject = async () => {
    if (!selectedPage) return;

    try {
      setError('');
      setSuccess('');
      await pagesApi.reject(selectedPage.slug, rejectionReason);
      setSuccess('Page rejected and deleted');
      setShowRejectModal(false);
      setSelectedPage(null);
      setRejectionReason('');
      await loadUnpublishedPages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject page');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this unpublished page?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await pagesApi.delete(slug);
      setSuccess('Page deleted successfully');
      await loadUnpublishedPages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete page');
    }
  };

  const openRejectModal = (page) => {
    setSelectedPage(page);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading unpublished pages...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <FileQuestion size={32} color="var(--primary-color)" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Unpublished Pages
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {user.role === 'admin' 
            ? 'Review and publish or reject pages that require approval'
            : 'View your unpublished pages awaiting approval'}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid var(--danger-color)',
          borderRadius: '0.5rem',
          color: 'var(--danger-color)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#efe',
          border: '1px solid var(--success-color)',
          borderRadius: '0.5rem',
          color: 'var(--success-color)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {unpublishedPages.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FileQuestion size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No unpublished pages at this time</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Title
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Slug
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Author
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Created
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {unpublishedPages.map((page) => (
                  <tr key={page.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {page.title}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <Link 
                        to={`/page/${page.slug}`}
                        style={{ 
                          color: 'var(--primary-color)', 
                          textDecoration: 'none'
                        }}
                      >
                        {page.slug}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {page.author_name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(page.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/page/${page.slug}`}
                          className="btn-secondary"
                          style={{ 
                            padding: '0.375rem 0.75rem', 
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="View page"
                        >
                          <Eye size={14} />
                        </Link>
                        {user.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handlePublish(page.slug)}
                              className="btn-primary"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                              title="Publish"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => openRejectModal(page)}
                              className="btn-danger"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {user.role === 'editor' && page.author_id === user.id && (
                          <button
                            onClick={() => handleDelete(page.slug)}
                            className="btn-danger"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Reject Page
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Provide a reason for rejecting this page (optional). The page will be deleted.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Content needs improvement, duplicate page, etc."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                fontFamily: 'inherit',
                fontSize: '0.875rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPage(null);
                  setRejectionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="btn-danger"
              >
                Reject and Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnpublishedPages;
