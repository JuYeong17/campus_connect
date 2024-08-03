// routes/likes.js

const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;

  const query = `
    SELECT q.*, l.created_at as liked_at
    FROM likes l
    JOIN questions q ON l.question_id = q.id
    WHERE l.user_id = ?
  `;

  connection.query(query, [user_id], (error, results) => {
    if (error) {
      console.error('Error fetching liked items:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 공감 토글
router.post('/toggle', (req, res) => {
  const { question_id, user_id, liked } = req.body;

  const checkLikeQuery = `SELECT * FROM likes WHERE question_id = ? AND user_id = ?`;
  const insertLikeQuery = `INSERT INTO likes (question_id, user_id) VALUES (?, ?)`;
  const deleteLikeQuery = `DELETE FROM likes WHERE question_id = ? AND user_id = ?`;
  const incrementLikeQuery = `UPDATE questions SET likes = likes + 1 WHERE id = ?`;
  const decrementLikeQuery = `UPDATE questions SET likes = likes - 1 WHERE id = ?`;

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

          // 좋아요 수 감소
          connection.query(decrementLikeQuery, [question_id], (updateError) => {
            if (updateError) {
              console.error('좋아요 수 감소 오류:', updateError);
              return res.status(500).json({ success: false, message: '좋아요 수 감소 오류' });
            }

            return res.json({ success: true, liked: false });
          });
        });
      } else {
        // 이미 좋아요 상태로 오류 반환
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

          // 좋아요 수 증가
          connection.query(incrementLikeQuery, [question_id], (updateError) => {
            if (updateError) {
              console.error('좋아요 수 증가 오류:', updateError);
              return res.status(500).json({ success: false, message: '좋아요 수 증가 오류' });
            }

            return res.json({ success: true, liked: true });
          });
        });
      } else {
        // 이미 좋아요가 없는 상태로 오류 반환
        return res.json({ success: false, message: '좋아요가 없는 상태입니다.' });
      }
    }
  });
});

module.exports = router;
