const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Helper function to check if request is authenticated
const isAuthenticated = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return false;
  
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return true;
  } catch (err) {
    return false;
  }
};

// Get all pages
router.get('/', async (req, res) => {
  try {
    const authenticated = isAuthenticated(req);

    // If authenticated, show all published pages. If not, show only public pages.
    const whereClause = authenticated ? 'p.is_published = true' : 'p.is_published = true AND p.is_public = true';
    
    const result = await pool.query(`
      SELECT p.*, u.username as author_name 
      FROM pages p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE ${whereClause}
      ORDER BY p.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single page by slug
router.get('/:slug', async (req, res) => {
  try {
    // Try to get user info if authenticated
    let user = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      } catch (err) {
        // Invalid token, continue as unauthenticated
      }
    }

    // Build query based on authentication and permissions
    let whereClause;
    let params = [req.params.slug];
    
    if (user) {
      // Authenticated users
      if (user.role === 'admin') {
        // Admins can see all pages (published and unpublished)
        whereClause = 'p.slug = $1';
      } else if (user.role === 'editor') {
        // Editors can see published pages and their own unpublished pages
        whereClause = 'p.slug = $1 AND (p.is_published = true OR p.author_id = $2)';
        params.push(user.id);
      } else {
        // Viewers can only see published pages
        whereClause = 'p.slug = $1 AND p.is_published = true';
      }
    } else {
      // Unauthenticated users can only see published and public pages
      whereClause = 'p.slug = $1 AND p.is_published = true AND p.is_public = true';
    }
    
    const result = await pool.query(`
      SELECT p.*, u.username as author_name 
      FROM pages p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create page
router.post('/', authenticateToken, authorizeRole('editor', 'admin'), async (req, res) => {
  try {
    const { title, slug, content, content_type, category, is_public } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    // Check if slug already exists
    const existing = await pool.query('SELECT id FROM pages WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Check if approval workflow is enabled
    const approvalSetting = await pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['approval_workflow_enabled']
    );

    const approvalEnabled = approvalSetting.rows.length > 0 && approvalSetting.rows[0].value === 'true';

    // Determine if page should be published
    // If user is editor and approval workflow is enabled, create as unpublished (requires admin approval)
    // Admins can always publish directly
    const shouldPublish = req.user.role === 'admin' || !approvalEnabled;

    const result = await pool.query(
      `INSERT INTO pages (title, slug, content, content_type, category, is_public, is_published, author_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, slug, content, content_type || 'markdown', category || null, is_public || false, shouldPublish, req.user.id]
    );

    if (!shouldPublish) {
      return res.status(201).json({ 
        ...result.rows[0],
        message: 'Page created and submitted for approval',
        requires_approval: true
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update page
router.put('/:slug', authenticateToken, authorizeRole('editor', 'admin'), async (req, res) => {
  try {
    const { title, content, content_type, category, is_public } = req.body;

    // Get current page
    const currentPage = await pool.query('SELECT * FROM pages WHERE slug = $1', [req.params.slug]);
    
    if (currentPage.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if approval workflow is enabled
    const approvalSetting = await pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['approval_workflow_enabled']
    );

    const approvalEnabled = approvalSetting.rows.length > 0 && approvalSetting.rows[0].value === 'true';

    // If user is editor and approval workflow is enabled, create pending edit
    if (req.user.role === 'editor' && approvalEnabled) {
      // Check if there's already a pending edit for this page by this editor
      const existingPending = await pool.query(
        'SELECT id FROM pending_page_edits WHERE page_id = $1 AND editor_id = $2 AND status = $3',
        [currentPage.rows[0].id, req.user.id, 'pending']
      );

      if (existingPending.rows.length > 0) {
        // Update existing pending edit
        const result = await pool.query(
          `UPDATE pending_page_edits 
           SET title = $1, content = $2, content_type = $3, category = $4, is_public = $5, created_at = CURRENT_TIMESTAMP
           WHERE id = $6
           RETURNING *`,
          [title, content, content_type, category || null, is_public !== undefined ? is_public : false, existingPending.rows[0].id]
        );
        return res.json({ 
          message: 'Edit submitted for approval (updated existing pending edit)',
          pending_edit: result.rows[0],
          requires_approval: true
        });
      } else {
        // Create new pending edit
        const result = await pool.query(
          `INSERT INTO pending_page_edits (page_id, title, content, content_type, category, is_public, editor_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [currentPage.rows[0].id, title, content, content_type, category || null, is_public !== undefined ? is_public : false, req.user.id, 'pending']
        );
        return res.json({ 
          message: 'Edit submitted for approval',
          pending_edit: result.rows[0],
          requires_approval: true
        });
      }
    }

    // Admin users or when approval workflow is disabled - update directly
    // Save revision
    await pool.query(
      'INSERT INTO page_revisions (page_id, content, author_id) VALUES ($1, $2, $3)',
      [currentPage.rows[0].id, currentPage.rows[0].content, req.user.id]
    );

    // Update page
    const result = await pool.query(
      `UPDATE pages 
       SET title = $1, content = $2, content_type = $3, category = $4, is_public = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE slug = $6 
       RETURNING *`,
      [title, content, content_type, category || null, is_public !== undefined ? is_public : false, req.params.slug]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete page
router.delete('/:slug', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pages WHERE slug = $1 RETURNING id', [req.params.slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update page order (admin only)
router.put('/order/:slug', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { display_order } = req.body;
    
    if (typeof display_order !== 'number' || display_order < 0) {
      return res.status(400).json({ error: 'display_order must be a non-negative number' });
    }

    const result = await pool.query(
      'UPDATE pages SET display_order = $1 WHERE slug = $2 RETURNING *',
      [display_order, req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating page order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unpublished pages (admin only - for approval, editor - their own)
router.get('/unpublished/list', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    // Admins see all unpublished pages, editors see only their own
    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.username as author_name 
        FROM pages p 
        LEFT JOIN users u ON p.author_id = u.id 
        WHERE p.is_published = false
        ORDER BY p.created_at DESC
      `;
    } else if (req.user.role === 'editor') {
      query = `
        SELECT p.*, u.username as author_name 
        FROM pages p 
        LEFT JOIN users u ON p.author_id = u.id 
        WHERE p.is_published = false AND p.author_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    } else {
      // Viewers cannot see unpublished pages
      return res.json([]);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching unpublished pages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish an unpublished page (admin only)
router.post('/:slug/publish', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE pages 
       SET is_published = true, updated_at = CURRENT_TIMESTAMP 
       WHERE slug = $1 AND is_published = false
       RETURNING *`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unpublished page not found' });
    }

    res.json({ 
      message: 'Page published successfully',
      page: result.rows[0]
    });
  } catch (error) {
    console.error('Error publishing page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject an unpublished page (admin only)
router.post('/:slug/reject', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    // Get the page first to return info to the user
    const page = await pool.query(
      'SELECT * FROM pages WHERE slug = $1 AND is_published = false',
      [req.params.slug]
    );

    if (page.rows.length === 0) {
      return res.status(404).json({ error: 'Unpublished page not found' });
    }

    // Delete the rejected page
    await pool.query(
      'DELETE FROM pages WHERE slug = $1',
      [req.params.slug]
    );

    res.json({ 
      message: 'Page rejected and deleted',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Error rejecting page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
