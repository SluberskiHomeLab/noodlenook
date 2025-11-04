const express = require('express');
const pool = require('../db');

const router = express.Router();

// Search pages
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await pool.query(`
      SELECT p.*, u.username as author_name,
             ts_rank(to_tsvector('english', p.title || ' ' || p.content), plainto_tsquery('english', $1)) as rank
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = true
        AND to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 50
    `, [q]);

    res.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
