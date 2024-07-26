const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 댓글 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM comments', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 댓글 추가
router.post('/', (req, res) => {
  const comment = req.body;
  connection.query('INSERT INTO comments SET ?', comment, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 댓글 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM comments WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 댓글 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const comment = req.body;
  connection.query('UPDATE comments SET ? WHERE id = ?', [comment, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 댓글 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM comments WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;