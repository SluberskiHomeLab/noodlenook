import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { settings as settingsApi } from '../utils/api';
import { Settings as SettingsIcon, Mail, Webhook, CheckCircle, AlertCircle, Eye, EyeOff, Layout, GitBranch } from 'lucide-react';

function SettingsPage() {
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('display');

  // Display Settings
  const [defaultSortOrder, setDefaultSortOrder] = useState('alphabetical');
  const [showSortDropdown, setShowSortDropdown] = useState(true);

  // Workflow Settings
  const [approvalWorkflowEnabled, setApprovalWorkflowEnabled] = useState(false);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState('false');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Webhook Settings
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookHeaders, setWebhookHeaders] = useState('');
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await settingsApi.getAll();
      const settingsMap = {};
      response.data.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      // Load Display settings
      setDefaultSortOrder(settingsMap['default_sort_order'] || 'alphabetical');
      setShowSortDropdown(settingsMap['show_sort_dropdown'] !== 'false');

      // Load Workflow settings
      setApprovalWorkflowEnabled(settingsMap['approval_workflow_enabled'] === 'true');

      // Load SMTP settings
      setSmtpHost(settingsMap['smtp_host'] || '');
      setSmtpPort(settingsMap['smtp_port'] || '587');
      setSmtpSecure(settingsMap['smtp_secure'] || 'false');
      setSmtpUser(settingsMap['smtp_user'] || '');
      setSmtpPass(settingsMap['smtp_pass'] || '');
      setSmtpFrom(settingsMap['smtp_from'] || '');

      // Load Webhook settings
      setWebhookUrl(settingsMap['webhook_url'] || '');
      setWebhookHeaders(settingsMap['webhook_headers'] || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveDisplaySettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await settingsApi.update('default_sort_order', defaultSortOrder, false);
      await settingsApi.update('show_sort_dropdown', showSortDropdown.toString(), false);

      setSuccess('Display settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save display settings');
    }
  };

  const saveWorkflowSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await settingsApi.update('approval_workflow_enabled', approvalWorkflowEnabled.toString(), false);

      setSuccess('Workflow settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workflow settings');
    }
  };

  const saveSmtpSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await settingsApi.update('smtp_host', smtpHost, false);
      await settingsApi.update('smtp_port', smtpPort, false);
      await settingsApi.update('smtp_secure', smtpSecure, false);
      await settingsApi.update('smtp_user', smtpUser, false);
      await settingsApi.update('smtp_pass', smtpPass, true); // encrypted
      await settingsApi.update('smtp_from', smtpFrom, false);

      setSuccess('SMTP settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save SMTP settings');
    }
  };

  const testSmtpConnection = async () => {
    setError('');
    setSuccess('');
    setTestingSmtp(true);

    try {
      const response = await settingsApi.testSmtp({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom
      });

      if (response.data.success) {
        setSuccess('SMTP connection successful! Your email configuration is working.');
      } else {
        setError(response.data.error || 'SMTP connection failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'SMTP connection test failed');
    } finally {
      setTestingSmtp(false);
    }
  };

  const saveWebhookSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate webhook headers if provided
      if (webhookHeaders) {
        try {
          JSON.parse(webhookHeaders);
        } catch (err) {
          setError('Invalid JSON in webhook headers. Please check the format.');
          return;
        }
      }

      await settingsApi.update('webhook_url', webhookUrl, false);
      await settingsApi.update('webhook_headers', webhookHeaders, false);

      setSuccess('Webhook settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save webhook settings');
    }
  };

  const testWebhook = async () => {
    setError('');
    setSuccess('');
    setTestingWebhook(true);

    try {
      let headers = {};
      if (webhookHeaders) {
        try {
          headers = JSON.parse(webhookHeaders);
        } catch (err) {
          setError('Invalid JSON in webhook headers');
          setTestingWebhook(false);
          return;
        }
      }

      const response = await settingsApi.testWebhook({
        url: webhookUrl,
        headers: headers
      });

      if (response.data.success) {
        setSuccess('Webhook test successful! The webhook endpoint responded correctly.');
      } else {
        setError(response.data.error || 'Webhook test failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Webhook test failed');
    } finally {
      setTestingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <SettingsIcon size={32} color="var(--primary-color)" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            System Settings
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Configure SMTP and Webhook integrations
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

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('display')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'display' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'display' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'display' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Layout size={20} />
            Display
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'smtp' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'smtp' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'smtp' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Mail size={20} />
            SMTP Email
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'webhook' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'webhook' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'webhook' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Webhook size={20} />
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'workflow' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'workflow' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'workflow' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <GitBranch size={20} />
            Workflow
          </button>
        </div>
      </div>

      {activeTab === 'display' && (
        <div className="card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Display Settings
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure default display settings for all users. These settings will apply to all users across the system.
          </p>

          <form onSubmit={saveDisplaySettings}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Default Page Sort Order
                </label>
                <select
                  value={defaultSortOrder}
                  onChange={(e) => setDefaultSortOrder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="category">Category</option>
                  <option value="recent">Recently Created</option>
                  <option value="creator">Creator</option>
                  <option value="custom">Custom Order (Admin Drag & Drop)</option>
                </select>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem'
                }}>
                  This setting determines how pages are organized in the sidebar for all users (including non-logged-in users). 
                  Users can still temporarily change the sort order for their session if the sort dropdown is enabled, but this will be the default.
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  <input
                    type="checkbox"
                    checked={showSortDropdown}
                    onChange={(e) => setShowSortDropdown(e.target.checked)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                  Show Sorting Dropdown to Users
                </label>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  marginLeft: '2rem'
                }}>
                  When enabled, all users (including non-logged-in users) will be able to see and use the sorting dropdown in the sidebar to change page sort order. 
                  When disabled, the sorting dropdown will be hidden for everyone and users will only see pages in the default sort order.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary">
                  Save Display Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'smtp' && (
        <div className="card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            SMTP Configuration
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure your SMTP server to send invitation emails. Common ports: 587 (TLS), 465 (SSL), 25 (Plain).
          </p>

          <form onSubmit={saveSmtpSettings}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  required
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    required
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Use SSL/TLS
                  </label>
                  <select
                    value={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="false">No (STARTTLS)</option>
                    <option value="true">Yes (SSL/TLS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="your-email@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Leave blank if authentication is not required
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  SMTP Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSmtpPass ? 'text' : 'password'}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '0.25rem'
                    }}
                  >
                    {showSmtpPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  From Email Address
                </label>
                <input
                  type="email"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  The email address that invitations will be sent from
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary">
                  Save SMTP Settings
                </button>
                <button
                  type="button"
                  onClick={testSmtpConnection}
                  disabled={testingSmtp || !smtpHost || !smtpPort}
                  className="btn-secondary"
                >
                  {testingSmtp ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'webhook' && (
        <div className="card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Webhook Configuration
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure a webhook endpoint to receive invitation notifications. The webhook will receive a POST request with JSON payload.
          </p>

          <form onSubmit={saveWebhookSettings}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Webhook URL *
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-endpoint.com/invitations"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  The URL where webhook notifications will be sent
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Custom Headers (JSON)
                </label>
                <textarea
                  value={webhookHeaders}
                  onChange={(e) => setWebhookHeaders(e.target.value)}
                  placeholder={'{\n  "Authorization": "Bearer your-token",\n  "Content-Type": "application/json"\n}'}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Optional custom headers in JSON format
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Webhook Payload Example
                </h3>
                <pre style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  overflow: 'auto',
                  margin: 0
                }}>
{`{
  "type": "invitation",
  "email": "user@example.com",
  "role": "editor",
  "invitation_link": "https://...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary">
                  Save Webhook Settings
                </button>
                <button
                  type="button"
                  onClick={testWebhook}
                  disabled={testingWebhook || !webhookUrl}
                  className="btn-secondary"
                >
                  {testingWebhook ? 'Testing...' : 'Test Webhook'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Approval Workflow Settings
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure approval workflow for page edits. When enabled, edits made by Editors will require Admin approval before being published.
          </p>

          <form onSubmit={saveWorkflowSettings}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  <input
                    type="checkbox"
                    checked={approvalWorkflowEnabled}
                    onChange={(e) => setApprovalWorkflowEnabled(e.target.checked)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                  Enable Approval Workflow for Editor Changes
                </label>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  marginLeft: '2rem'
                }}>
                  When enabled, page edits made by Editors will be saved as pending and require Admin approval. 
                  Admins can always edit pages directly without approval.
                </p>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  How It Works
                </h3>
                <ul style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginLeft: '1.25rem',
                  marginBottom: 0
                }}>
                  <li>When enabled, Editors submit edits for review instead of publishing directly</li>
                  <li>Admins receive notifications of pending edits (view in Admin Dashboard)</li>
                  <li>Admins can approve or reject edits with optional feedback</li>
                  <li>Approved edits are immediately published to the page</li>
                  <li>Rejected edits notify the Editor with the rejection reason</li>
                  <li>Admins always bypass the workflow and can edit directly</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary">
                  Save Workflow Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
