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

  const checkLikeQuery = `SELECT * FROM likes WHERE question_id = ? AND user_id = ?`;
  const insertLikeQuery = `INSERT INTO likes (question_id, user_id) VALUES (?, ?)`;
  const deleteLikeQuery = `DELETE FROM likes WHERE question_id = ? AND user_id = ?`;

  connection.query(checkLikeQuery, [question_id, user_id], (error, results) => {
    if (error) {
      console.error('좋아요 확인 오류:', error);
      return res.status(500).json({ success: false, message: '좋아요 확인 오류' });
    }

    if (results.length > 0) {
      // 이미 좋아요가 있는 경우
      if (liked) {
        // 좋아요 취소
        connection.query(deleteLikeQuery, [question_id, user_id], (deleteError) => {
          if (deleteError) {
            console.error('좋아요 취소 오류:', deleteError);
            return res.status(500).json({ success: false, message: '좋아요 취소 오류' });
          }

          return res.json({ success: true, liked: false });
        });
      } else {
        // 좋아요 이미 있는 상태로 오류 반환
        return res.json({ success: false, message: '이미 좋아요 상태입니다.' });
      }
    } else {
      // 좋아요가 없는 경우
      if (!liked) {
        // 좋아요 추가
        connection.query(insertLikeQuery, [question_id, user_id], (insertError) => {
          if (insertError) {
            console.error('좋아요 추가 오류:', insertError);
            return res.status(500).json({ success: false, message: '좋아요 추가 오류' });
          }

          return res.json({ success: true, liked: true });
        });
      } else {
        // 좋아요가 없는 상태로 오류 반환
        return res.json({ success: false, message: '좋아요가 없는 상태입니다.' });
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
