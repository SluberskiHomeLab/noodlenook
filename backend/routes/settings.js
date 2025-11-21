const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();

// Default values for settings
const DEFAULT_VALUES = {
  default_sort_order: 'alphabetical',
  show_sort_dropdown: 'true'
};

// Get all settings (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT key, value, encrypted, updated_at 
      FROM system_settings 
      ORDER BY key
    `);
    
    // Decrypt sensitive values for display
    const settings = result.rows.map(setting => ({
      ...setting,
      value: setting.encrypted && setting.value ? decrypt(setting.value) : setting.value
    }));
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific setting
router.get('/:key', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query(
      'SELECT key, value, encrypted FROM system_settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const setting = result.rows[0];
    if (setting.encrypted && setting.value) {
      setting.value = decrypt(setting.value);
    }

    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public settings (accessible to all users, including non-authenticated)
router.get('/public/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    // List of settings that are public (non-sensitive)
    const publicSettings = ['default_sort_order', 'show_sort_dropdown'];
    
    if (!publicSettings.includes(key)) {
      return res.status(403).json({ error: 'This setting is not publicly accessible' });
    }
    
    const result = await pool.query(
      'SELECT key, value FROM system_settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      // Return default value if setting doesn't exist
      const defaultValue = DEFAULT_VALUES[key] || null;
      return res.json({ key, value: defaultValue });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching public setting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update or create a setting (admin only)
router.put('/:key', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, encrypted } = req.body;

    const finalValue = encrypted && value ? encrypt(value) : value;

    const result = await pool.query(`
      INSERT INTO system_settings (key, value, encrypted, updated_by, updated_at) 
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = $2,
        encrypted = $3,
        updated_by = $4,
        updated_at = NOW()
      RETURNING key, value, encrypted, updated_at
    `, [key, finalValue, encrypted || false, req.user.id]);

    const setting = result.rows[0];
    if (setting.encrypted && setting.value) {
      setting.value = decrypt(setting.value);
    }

    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a setting (admin only)
router.delete('/:key', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await pool.query(
      'DELETE FROM system_settings WHERE key = $1 RETURNING key',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test SMTP connection (admin only)
router.post('/test-smtp', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { host, port, secure, user, pass, from } = req.body;
    
    // Import nodemailer dynamically
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: secure === 'true' || secure === true,
      auth: user && pass ? {
        user: user,
        pass: pass
      } : undefined
    });

    // Verify connection
    await transporter.verify();

    res.json({ success: true, message: 'SMTP connection successful' });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'SMTP connection failed: ' + error.message 
    });
  }
});

// Test webhook (admin only)
router.post('/test-webhook', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { url, headers } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL to prevent SSRF attacks
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTPS for production webhooks (allow HTTP for testing)
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
      }
      
      // Prevent requests to private/local networks
      const hostname = parsedUrl.hostname.toLowerCase();
      const privateNetworks = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '10.',
        '172.16.',
        '172.17.',
        '172.18.',
        '172.19.',
        '172.20.',
        '172.21.',
        '172.22.',
        '172.23.',
        '172.24.',
        '172.25.',
        '172.26.',
        '172.27.',
        '172.28.',
        '172.29.',
        '172.30.',
        '172.31.',
        '192.168.',
        '169.254.'
      ];
      
      if (privateNetworks.some(net => hostname.startsWith(net))) {
        return res.status(400).json({ error: 'Requests to private/local networks are not allowed' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const axios = require('axios');
    
    const testPayload = {
      test: true,
      message: 'This is a test webhook from NoodleNook',
      timestamp: new Date().toISOString()
    };

    const config = {
      headers: headers || {},
      timeout: 5000, // 5 second timeout
      maxRedirects: 0 // Don't follow redirects to prevent SSRF
    };

    const response = await axios.post(url, testPayload, config);

    res.json({ 
      success: true, 
      message: 'Webhook test successful',
      status: response.status 
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Webhook test failed: ' + (error.response?.data || error.message)
    });
  }
});

module.exports = router;
