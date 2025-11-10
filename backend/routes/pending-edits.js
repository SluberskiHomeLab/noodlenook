const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all pending edits
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    // Admins see all pending edits, editors see only their own
    if (req.user.role === 'admin') {
      query = `
        SELECT pe.*, p.slug as page_slug, u.username as editor_name
        FROM pending_page_edits pe
        JOIN pages p ON pe.page_id = p.id
        JOIN users u ON pe.editor_id = u.id
        WHERE pe.status = $1
        ORDER BY pe.created_at DESC
      `;
      params = ['pending'];
    } else {
      query = `
        SELECT pe.*, p.slug as page_slug, u.username as editor_name
        FROM pending_page_edits pe
        JOIN pages p ON pe.page_id = p.id
        JOIN users u ON pe.editor_id = u.id
        WHERE pe.editor_id = $1 AND pe.status = $2
        ORDER BY pe.created_at DESC
      `;
      params = [req.user.id, 'pending'];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending edits:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single pending edit
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pe.*, p.slug as page_slug, p.title as current_title, p.content as current_content, 
              p.content_type as current_content_type, p.category as current_category, p.is_public as current_is_public,
              u.username as editor_name
       FROM pending_page_edits pe
       JOIN pages p ON pe.page_id = p.id
       JOIN users u ON pe.editor_id = u.id
       WHERE pe.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit not found' });
    }

    const edit = result.rows[0];

    // Check permissions - editors can only see their own, admins can see all
    if (req.user.role !== 'admin' && edit.editor_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json(edit);
  } catch (error) {
    console.error('Error fetching pending edit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve pending edit (admin only)
router.post('/:id/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Get pending edit
    const pendingEdit = await pool.query(
      `SELECT pe.*, p.slug as page_slug, p.content as current_content
       FROM pending_page_edits pe
       JOIN pages p ON pe.page_id = p.id
       WHERE pe.id = $1 AND pe.status = $2`,
      [req.params.id, 'pending']
    );

    if (pendingEdit.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit not found or already reviewed' });
    }

    const edit = pendingEdit.rows[0];

    // Save current content as revision before applying edit
    await pool.query(
      'INSERT INTO page_revisions (page_id, content, author_id) VALUES ($1, $2, $3)',
      [edit.page_id, edit.current_content, edit.editor_id]
    );

    // Apply the edit to the page
    await pool.query(
      `UPDATE pages 
       SET title = $1, content = $2, content_type = $3, category = $4, is_public = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [edit.title, edit.content, edit.content_type, edit.category, edit.is_public, edit.page_id]
    );

    // Mark pending edit as approved
    await pool.query(
      `UPDATE pending_page_edits 
       SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      ['approved', req.user.id, req.params.id]
    );

    res.json({ 
      message: 'Edit approved successfully',
      page_slug: edit.page_slug
    });
  } catch (error) {
    console.error('Error approving edit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject pending edit (admin only)
router.post('/:id/reject', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if pending edit exists
    const pendingEdit = await pool.query(
      'SELECT id FROM pending_page_edits WHERE id = $1 AND status = $2',
      [req.params.id, 'pending']
    );

    if (pendingEdit.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit not found or already reviewed' });
    }

    // Mark pending edit as rejected
    await pool.query(
      `UPDATE pending_page_edits 
       SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = $3
       WHERE id = $4`,
      ['rejected', req.user.id, reason || '', req.params.id]
    );

    res.json({ message: 'Edit rejected successfully' });
  } catch (error) {
    console.error('Error rejecting edit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete pending edit (editor can delete their own, admin can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get pending edit
    const pendingEdit = await pool.query(
      'SELECT editor_id FROM pending_page_edits WHERE id = $1',
      [req.params.id]
    );

    if (pendingEdit.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && pendingEdit.rows[0].editor_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete pending edit
    await pool.query('DELETE FROM pending_page_edits WHERE id = $1', [req.params.id]);

    res.json({ message: 'Pending edit deleted successfully' });
  } catch (error) {
    console.error('Error deleting pending edit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
