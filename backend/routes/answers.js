const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 답변 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM answers', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 답변 추가
router.post('/', (req, res) => {
  const answer = req.body;
  connection.query('INSERT INTO answers SET ?', answer, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 답변 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM answers WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 답변 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const answer = req.body;
  connection.query('UPDATE answers SET ? WHERE id = ?', [answer, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 답변 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM answers WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;