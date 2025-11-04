const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    // Check if this is the last admin
    if (role !== 'admin') {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1',
        ['admin']
      );
      
      const targetUser = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [id]
      );

      if (targetUser.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (targetUser.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) === 1) {
        return res.status(403).json({ error: 'Cannot change role of the last admin' });
      }
    }

    // Update role
    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, username, email, role, updated_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
