const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username as author_name 
      FROM pages p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE p.is_published = true 
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
    const result = await pool.query(`
      SELECT p.*, u.username as author_name 
      FROM pages p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE p.slug = $1 AND p.is_published = true
    `, [req.params.slug]);

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
    const { title, slug, content, content_type } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    // Check if slug already exists
    const existing = await pool.query('SELECT id FROM pages WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const result = await pool.query(
      `INSERT INTO pages (title, slug, content, content_type, author_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, slug, content, content_type || 'markdown', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update page
router.put('/:slug', authenticateToken, authorizeRole('editor', 'admin'), async (req, res) => {
  try {
    const { title, content, content_type } = req.body;

    // Get current page
    const currentPage = await pool.query('SELECT * FROM pages WHERE slug = $1', [req.params.slug]);
    
    if (currentPage.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Save revision
    await pool.query(
      'INSERT INTO page_revisions (page_id, content, author_id) VALUES ($1, $2, $3)',
      [currentPage.rows[0].id, currentPage.rows[0].content, req.user.id]
    );

    // Update page
    const result = await pool.query(
      `UPDATE pages 
       SET title = $1, content = $2, content_type = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE slug = $4 
       RETURNING *`,
      [title, content, content_type, req.params.slug]
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

module.exports = router;
