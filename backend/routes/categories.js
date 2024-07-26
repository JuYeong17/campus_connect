const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 카테고리 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM categories', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 카테고리 추가
router.post('/', (req, res) => {
  const category = req.body;
  connection.query('INSERT INTO categories SET ?', category, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(results);
  });
});

// 특정 카테고리 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM categories WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 카테고리 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const category = req.body;
  connection.query('UPDATE categories SET ? WHERE id = ?', [category, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 카테고리 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM categories WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;