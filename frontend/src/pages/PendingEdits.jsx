import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { pendingEdits as pendingEditsApi } from '../utils/api';
import { GitBranch, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

function PendingEdits() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingEdits();
  }, []);

  const loadPendingEdits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pendingEditsApi.getAll();
      setPendingEdits(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending edits');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (editId) => {
    if (!window.confirm('Are you sure you want to approve this edit?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await pendingEditsApi.approve(editId);
      setSuccess('Edit approved successfully');
      await loadPendingEdits();
      setTimeout(() => setSuccess(''), 3000);
      
      // Optionally navigate to the page
      if (response.data.page_slug) {
        setTimeout(() => navigate(`/page/${response.data.page_slug}`), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve edit');
    }
  };

  const handleReject = async () => {
    if (!selectedEdit) return;

    try {
      setError('');
      setSuccess('');
      await pendingEditsApi.reject(selectedEdit.id, rejectionReason);
      setSuccess('Edit rejected successfully');
      setShowRejectModal(false);
      setSelectedEdit(null);
      setRejectionReason('');
      await loadPendingEdits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject edit');
    }
  };

  const handleDelete = async (editId) => {
    if (!window.confirm('Are you sure you want to delete this pending edit?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await pendingEditsApi.delete(editId);
      setSuccess('Pending edit deleted successfully');
      await loadPendingEdits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete pending edit');
    }
  };

  const openRejectModal = (edit) => {
    setSelectedEdit(edit);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading pending edits...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <GitBranch size={32} color="var(--primary-color)" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Pending Page Edits
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {user.role === 'admin' 
            ? 'Review and approve or reject page edits submitted by editors'
            : 'View the status of your submitted page edits'}
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

      {pendingEdits.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <GitBranch size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No pending edits at this time</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Page
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Title
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Editor
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Submitted
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingEdits.map((edit) => (
                  <tr key={edit.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      <Link 
                        to={`/page/${edit.page_slug}`}
                        style={{ 
                          color: 'var(--primary-color)', 
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {edit.page_slug}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {edit.title}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {edit.editor_name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(edit.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/pending-edits/${edit.id}`}
                          className="btn-secondary"
                          style={{ 
                            padding: '0.375rem 0.75rem', 
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="View details"
                        >
                          <Eye size={14} />
                        </Link>
                        {user.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleApprove(edit.id)}
                              className="btn-primary"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                              title="Approve"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => openRejectModal(edit)}
                              className="btn-danger"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {user.role === 'editor' && edit.editor_id === user.id && (
                          <button
                            onClick={() => handleDelete(edit.id)}
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
                  setSelectedEdit(null);
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

export default PendingEdits;
