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

// 좋아요 추가 또는 삭제 (토글 기능)
router.post('/toggle', (req, res) => {
  const { question_id, user_id, liked } = req.body;

  if (liked) {
    // 좋아요 취소 (삭제)
    connection.query(
      'DELETE FROM likes WHERE question_id = ? AND user_id = ?',
      [question_id, user_id],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json({ message: '좋아요 취소', liked: false });
      }
    );
  } else {
    // 좋아요 추가
    connection.query(
      'INSERT INTO likes (question_id, user_id) VALUES (?, ?)',
      [question_id, user_id],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: '좋아요 추가', liked: true });
      }
    );
  }
});

module.exports = router;
