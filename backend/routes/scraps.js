const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 스크랩 추가 또는 삭제 (토글 기능)
router.post('/toggle', (req, res) => {
  const { question_id, user_id, scrapped } = req.body;

  if (scrapped) {
    // 스크랩 취소 (삭제)
    connection.query(
      'DELETE FROM scraps WHERE question_id = ? AND user_id = ?',
      [question_id, user_id],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json({ message: '스크랩 취소', scrapped: false });
      }
    );
  } else {
    // 스크랩 추가
    connection.query(
      'INSERT INTO scraps (question_id, user_id) VALUES (?, ?)',
      [question_id, user_id],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: '스크랩 추가', scrapped: true });
      }
    );
  }
});

module.exports = router;
