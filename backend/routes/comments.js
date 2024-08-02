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

// 특정 답변에 대한 댓글 가져오기
router.get('/:answerId', (req, res) => {
  const { answerId } = req.params;
  connection.query('SELECT * FROM comments WHERE answer_id = ?', [answerId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 댓글 추가
router.post('/', (req, res) => {
  const { content, answer_id, user_id } = req.body;
  const newComment = { content, answer_id, user_id, created_at: new Date() };
  
  connection.query('INSERT INTO comments SET ?', newComment, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ id: results.insertId, ...newComment });
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
