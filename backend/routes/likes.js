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

  // 중복 체크
  const checkQuery = 'SELECT * FROM likes WHERE question_id = ? AND user_id = ?';
  connection.query(checkQuery, [question_id, user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      // 이미 좋아요가 존재하는 경우
      if (liked) {
        // 좋아요 취소 (삭제)
        const deleteQuery = 'DELETE FROM likes WHERE question_id = ? AND user_id = ?';
        connection.query(deleteQuery, [question_id, user_id], (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.json({ success: true, message: '좋아요 취소', liked: false });
        });
      } else {
        // 이미 좋아요가 존재하는 상태에서 추가 요청을 받았을 때
        res.json({ success: false, message: '이미 좋아요가 존재합니다.' });
      }
    } else {
      // 좋아요 추가
      if (!liked) {
        const insertQuery = 'INSERT INTO likes (question_id, user_id) VALUES (?, ?)';
        connection.query(insertQuery, [question_id, user_id], (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.status(201).json({ success: true, message: '좋아요 추가', liked: true });
        });
      } else {
        // 이미 좋아요가 없는 상태에서 취소 요청을 받았을 때
        res.json({ success: false, message: '좋아요가 존재하지 않습니다.' });
      }
    }
  });
});
router.get('/count/:questionId', (req, res) => {
  const { questionId } = req.params;

  const countLikesQuery = `SELECT COUNT(*) AS likesCount FROM likes WHERE question_id = ?`;

  connection.query(countLikesQuery, [questionId], (error, results) => {
    if (error) {
      console.error('좋아요 수 가져오기 오류:', error);
      return res.status(500).json({ success: false, message: '좋아요 수 가져오기 오류' });
    }

    const likesCount = results[0].likesCount;
    res.json({ success: true, likesCount });
  });
});

module.exports = router;
