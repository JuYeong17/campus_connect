const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 사용자 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 사용자 추가
router.post('/', (req, res) => {
  const user = req.body;
  connection.query('INSERT INTO users SET ?', user, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 사용자 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nickname, password } = req.body; // Expecting nickname and password

  // Validate inputs
  if (!nickname && !password) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Construct the SQL update query dynamically
  const fields = {};
  if (nickname) fields.nickname = nickname;
  if (password) fields.password = password; // Ensure password is hashed appropriately

  connection.query('UPDATE users SET ? WHERE id = ?', [fields, id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, message: 'User updated successfully', results });
  });
});

// 사용자 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});


module.exports = router;