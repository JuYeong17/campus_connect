const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 스크랩 추가 또는 삭제 (토글 기능)
router.post('/toggle', (req, res) => {
  const { question_id, user_id, scrapped } = req.body;

  // 중복 체크
  const checkQuery = 'SELECT * FROM scraps WHERE question_id = ? AND user_id = ?';
  connection.query(checkQuery, [question_id, user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      // 이미 스크랩이 존재하는 경우
      if (scrapped) {
        // 스크랩 취소 (삭제)
        const deleteQuery = 'DELETE FROM scraps WHERE question_id = ? AND user_id = ?';
        connection.query(deleteQuery, [question_id, user_id], (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.json({ success: true, message: '스크랩 취소', scrapped: false });
        });
      } else {
        // 이미 스크랩이 존재하는 상태에서 추가 요청을 받았을 때
        res.json({ success: false, message: '이미 스크랩이 존재합니다.' });
      }
    } else {
      // 스크랩 추가
      if (!scrapped) {
        const insertQuery = 'INSERT INTO scraps (question_id, user_id) VALUES (?, ?)';
        connection.query(insertQuery, [question_id, user_id], (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.status(201).json({ success: true, message: '스크랩 추가', scrapped: true });
        });
      } else {
        // 이미 스크랩이 없는 상태에서 취소 요청을 받았을 때
        res.json({ success: false, message: '스크랩이 존재하지 않습니다.' });
      }
    }
  });
});


module.exports = router;
