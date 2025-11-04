const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

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
    if (method === 'smtp') {
      // TODO: Implement SMTP email sending
      // For now, we'll just return the link
      console.log('SMTP invitation would be sent to:', email);
      console.log('Invitation link:', invitationLink);
    } else if (method === 'webhook') {
      // TODO: Implement webhook notification
      // For now, we'll just log it
      console.log('Webhook invitation would be sent to:', email);
      console.log('Invitation link:', invitationLink);
    }

    res.status(201).json({
      ...invitation,
      invitation_link: invitationLink,
      message: 'Invitation created successfully'
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
