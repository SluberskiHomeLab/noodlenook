import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import { pendingEdits as pendingEditsApi } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import { GitBranch, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function PendingEditDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'new-only'

  useEffect(() => {
    loadPendingEdit();
  }, [id]);

  const loadPendingEdit = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pendingEditsApi.getById(id);
      setEdit(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending edit');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this edit?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await pendingEditsApi.approve(id);
      setSuccess('Edit approved successfully! Redirecting to page...');
      setTimeout(() => {
        if (response.data.page_slug) {
          navigate(`/page/${response.data.page_slug}`);
        } else {
          navigate('/pending-edits');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve edit');
    }
  };

  const handleReject = async () => {
    try {
      setError('');
      setSuccess('');
      await pendingEditsApi.reject(id, rejectionReason);
      setSuccess('Edit rejected successfully! Redirecting...');
      setShowRejectModal(false);
      setTimeout(() => navigate('/pending-edits'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject edit');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading pending edit...
        </div>
      </div>
    );
  }

  if (!edit) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={48} color="var(--danger-color)" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Pending edit not found</p>
            <Link to="/pending-edits" style={{ color: 'var(--primary-color)' }}>
              Back to Pending Edits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/pending-edits" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--primary-color)',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back to Pending Edits
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <GitBranch size={32} color="var(--primary-color)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Review Pending Edit
            </h1>
          </div>
          {user.role === 'admin' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleApprove}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <CheckCircle size={18} />
                Approve Edit
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <XCircle size={18} />
                Reject Edit
              </button>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--text-secondary)' }}>
          Page: <Link to={`/page/${edit.page_slug}`} style={{ color: 'var(--primary-color)' }}>{edit.page_slug}</Link> • 
          Editor: {edit.editor_name} • 
          Submitted: {new Date(edit.created_at).toLocaleString()}
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

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={viewMode === 'side-by-side' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem' }}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('new-only')}
            className={viewMode === 'new-only' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem' }}
          >
            New Version Only
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Current Version
            </h2>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {edit.current_title}
              </h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Type: {edit.current_content_type} • Category: {edit.current_category || 'None'} • 
                Public: {edit.current_is_public ? 'Yes' : 'No'}
              </div>
            </div>
            <div style={{ color: 'var(--text-primary)' }}>
              {edit.current_content_type === 'markdown' ? (
                <ReactMarkdown>{edit.current_content}</ReactMarkdown>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: edit.current_content }} />
              )}
            </div>
          </div>

          <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1rem' }}>
              Proposed Changes
            </h2>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {edit.title}
              </h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Type: {edit.content_type} • Category: {edit.category || 'None'} • 
                Public: {edit.is_public ? 'Yes' : 'No'}
              </div>
            </div>
            <div style={{ color: 'var(--text-primary)' }}>
              {edit.content_type === 'markdown' ? (
                <ReactMarkdown>{edit.content}</ReactMarkdown>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: edit.content }} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Proposed Changes
          </h2>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {edit.title}
            </h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Type: {edit.content_type} • Category: {edit.category || 'None'} • 
              Public: {edit.is_public ? 'Yes' : 'No'}
            </div>
          </div>
          <div style={{ color: 'var(--text-primary)' }}>
            {edit.content_type === 'markdown' ? (
              <ReactMarkdown>{edit.content}</ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: edit.content }} />
            )}
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
              Reject Edit
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Provide a reason for rejecting this edit (optional):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Please add more details, formatting needs improvement, etc."
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
                Reject Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingEditDetail;
