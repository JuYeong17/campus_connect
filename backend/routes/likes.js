const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 좋아요 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM likes', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 좋아요 추가
router.post('/', (req, res) => {
  const like = req.body;
  connection.query('INSERT INTO likes SET ?', like, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 좋아요 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM likes WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 좋아요 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const like = req.body;
  connection.query('UPDATE likes SET ? WHERE id = ?', [like, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 좋아요 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM likes WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;