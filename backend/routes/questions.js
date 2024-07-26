const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 질문 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM questions', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 질문 추가
router.post('/', (req, res) => {
  const question = req.body;
  connection.query('INSERT INTO questions SET ?', question, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 질문 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM questions WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 질문 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const question = req.body;
  connection.query('UPDATE questions SET ? WHERE id = ?', [question, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 질문 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM questions WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;