const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// Update user points
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  if (points === undefined) {
    return res.status(400).json({ error: 'Points value is required' });
  }

  connection.query('UPDATE users SET points = points + ? WHERE id = ?', [points, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, message: 'User points updated successfully', results });
  });
});

module.exports = router;