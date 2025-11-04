const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Helper function to get setting value
async function getSetting(key) {
  const result = await pool.query(
    'SELECT value, encrypted FROM system_settings WHERE key = $1',
    [key]
  );
  
  if (result.rows.length === 0) {
    return null;
  }

  const setting = result.rows[0];
  
  // Decrypt if encrypted (simplified decryption - matches settings.js)
  if (setting.encrypted && setting.value) {
    const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    const ALGORITHM = 'aes-256-ctr';
    
    try {
      const parts = setting.value.split(':');
      const iv = Buffer.from(parts.shift(), 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString();
    } catch (err) {
      console.error('Error decrypting setting:', err);
      return null;
    }
  }
  
  return setting.value;
}

// Helper function to send email via SMTP
async function sendInvitationEmail(email, invitationLink, role) {
  try {
    const smtpHost = await getSetting('smtp_host');
    const smtpPort = await getSetting('smtp_port');
    const smtpSecure = await getSetting('smtp_secure');
    const smtpUser = await getSetting('smtp_user');
    const smtpPass = await getSetting('smtp_pass');
    const smtpFrom = await getSetting('smtp_from');

    if (!smtpHost || !smtpPort) {
      console.log('SMTP not configured');
      return { success: false, error: 'SMTP not configured' };
    }

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure === 'true',
      auth: smtpUser && smtpPass ? {
        user: smtpUser,
        pass: smtpPass
      } : undefined
    });

    const mailOptions = {
      from: smtpFrom || smtpUser,
      to: email,
      subject: 'You\'re invited to join NoodleNook',
      text: `You've been invited to join NoodleNook as a ${role}.\n\nClick the link below to accept your invitation:\n${invitationLink}\n\nThis invitation will expire in 7 days.`,
      html: `
        <h2>You're invited to join NoodleNook</h2>
        <p>You've been invited to join NoodleNook as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept your invitation:</p>
        <p><a href="${invitationLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${invitationLink}</p>
        <p><em>This invitation will expire in 7 days.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to send webhook notification
async function sendWebhookNotification(email, invitationLink, role) {
  try {
    const webhookUrl = await getSetting('webhook_url');
    const webhookHeaders = await getSetting('webhook_headers');

    if (!webhookUrl) {
      console.log('Webhook not configured');
      return { success: false, error: 'Webhook not configured' };
    }

    const axios = require('axios');

    const payload = {
      type: 'invitation',
      email: email,
      role: role,
      invitation_link: invitationLink,
      timestamp: new Date().toISOString()
    };

    const headers = {};
    if (webhookHeaders) {
      try {
        Object.assign(headers, JSON.parse(webhookHeaders));
      } catch (err) {
        console.error('Error parsing webhook headers:', err);
      }
    }

    await axios.post(webhookUrl, payload, { headers });
    return { success: true };
  } catch (error) {
    console.error('Error sending webhook:', error);
    return { success: false, error: error.message };
  }
}

// Get all invitations (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.username as invited_by_name 
      FROM invitations i 
      LEFT JOIN users u ON i.invited_by = u.id 
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create invitation (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { email, role, method } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Validate role
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if invitation already exists
    const existingInvitation = await pool.query(
      'SELECT id FROM invitations WHERE email = $1 AND used = false',
      [email]
    );

    if (existingInvitation.rows.length > 0) {
      return res.status(400).json({ error: 'An active invitation for this email already exists' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const result = await pool.query(
      `INSERT INTO invitations (email, token, role, invited_by, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, token, role, req.user.id, expiresAt]
    );

    const invitation = result.rows[0];

    // Generate invitation link using BASE_URL from env or fallback to request host
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const invitationLink = `${baseUrl}/register?token=${token}`;

    // Send notification based on method
    let notificationResult = { success: true };
    
    if (method === 'smtp') {
      notificationResult = await sendInvitationEmail(email, invitationLink, role);
      if (!notificationResult.success) {
        console.error('Failed to send SMTP invitation:', notificationResult.error);
      }
    } else if (method === 'webhook') {
      notificationResult = await sendWebhookNotification(email, invitationLink, role);
      if (!notificationResult.success) {
        console.error('Failed to send webhook notification:', notificationResult.error);
      }
    }

    res.status(201).json({
      ...invitation,
      invitation_link: invitationLink,
      message: 'Invitation created successfully',
      notification_sent: notificationResult.success,
      notification_error: notificationResult.error
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate invitation token
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT * FROM invitations 
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    const invitation = result.rows[0];
    res.json({ 
      email: invitation.email, 
      role: invitation.role 
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete/revoke invitation (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM invitations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
