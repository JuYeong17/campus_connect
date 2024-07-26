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

// 사용자 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const user = req.body;
  connection.query('UPDATE users SET ? WHERE id = ?', [user, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
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