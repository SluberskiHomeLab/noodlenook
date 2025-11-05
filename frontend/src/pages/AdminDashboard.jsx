import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { users as usersApi, invitations as invitationsApi } from '../utils/api';
import { Users, Shield, AlertCircle, CheckCircle, Mail, Copy, Settings } from 'lucide-react';

function AdminDashboard() {
  const { user } = useApp();
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteMethod, setInviteMethod] = useState('link');

  useEffect(() => {
    loadUsers();
    loadInvitations();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await invitationsApi.getAll();
      setInvitations(response.data);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError('');
      setSuccess('');
      await usersApi.updateRole(userId, newRole);
      setSuccess('User role updated successfully');
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await invitationsApi.create(inviteEmail, inviteRole, inviteMethod);
      setSuccess('Invitation created successfully');
      
      // Copy invitation link to clipboard if method is 'link'
      if (inviteMethod === 'link' && response.data.invitation_link) {
        navigator.clipboard.writeText(response.data.invitation_link);
        setSuccess('Invitation link copied to clipboard!');
      }
      
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('viewer');
      await loadInvitations();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await invitationsApi.delete(invitationId);
      setSuccess('Invitation revoked successfully');
      await loadInvitations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke invitation');
    }
  };

  const copyInvitationLink = (token) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    setSuccess('Invitation link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'var(--danger-color)';
      case 'editor':
        return 'var(--primary-color)';
      case 'viewer':
        return 'var(--text-tertiary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} color="var(--danger-color)" />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Admin Dashboard
            </h1>
          </div>
          <Link to="/settings">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} />
              System Settings
            </button>
          </Link>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Manage users and system configuration
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

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Users size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            User Management
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  Username
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  Email
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  Role
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  Joined
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr 
                  key={u.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: u.id === user.id ? 'var(--bg-secondary)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {u.username}
                    {u.id === user.id && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        fontStyle: 'italic'
                      }}>
                        (You)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: getRoleBadgeColor(u.role) + '20',
                      color: getRoleBadgeColor(u.role),
                      border: `1px solid ${getRoleBadgeColor(u.role)}`,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.id === user.id ? (
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        Cannot modify own role
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingUserId === u.id}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: updatingUserId === u.id ? 'wait' : 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No users found
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              User Invitations
            </h2>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="btn-primary"
          >
            <Mail size={18} />
            Invite User
          </button>
        </div>

        {showInviteForm && (
          <form onSubmit={handleInviteUser} style={{ 
            marginBottom: '1.5rem', 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Create New Invitation
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="user@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                User Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Invitation Method
              </label>
              <select
                value={inviteMethod}
                onChange={(e) => setInviteMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="link">Copy Link (Manual)</option>
                <option value="smtp">Send via SMTP Email</option>
                <option value="webhook">Send via Webhook</option>
              </select>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
              }}>
                {inviteMethod === 'link' && 'The invitation link will be copied to your clipboard'}
                {inviteMethod === 'smtp' && 'Email will be sent using configured SMTP settings'}
                {inviteMethod === 'webhook' && 'Notification will be sent to configured webhook endpoint'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary">
                Create Invitation
              </button>
              <button 
                type="button" 
                onClick={() => setShowInviteForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Email
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Role
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Created
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Expires
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {inv.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: getRoleBadgeColor(inv.role) + '20',
                      color: getRoleBadgeColor(inv.role),
                      border: `1px solid ${getRoleBadgeColor(inv.role)}`,
                    }}>
                      {inv.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {inv.used ? (
                      <span style={{ color: 'var(--success-color)' }}>✓ Used</span>
                    ) : new Date(inv.expires_at) < new Date() ? (
                      <span style={{ color: 'var(--danger-color)' }}>Expired</span>
                    ) : (
                      <span style={{ color: 'var(--warning-color)' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(inv.expires_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!inv.used && new Date(inv.expires_at) > new Date() && (
                        <button
                          onClick={() => copyInvitationLink(inv.token)}
                          className="btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          title="Copy invitation link"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRevokeInvitation(inv.id)}
                        className="btn-danger"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invitations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No invitations found
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          System Information
        </h2>
        <div style={{ color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Total Users:</strong> {users.length}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Admins:</strong> {users.filter(u => u.role === 'admin').length}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Editors:</strong> {users.filter(u => u.role === 'editor').length}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Viewers:</strong> {users.filter(u => u.role === 'viewer').length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
