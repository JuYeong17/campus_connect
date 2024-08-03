const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 스크랩 추가 또는 삭제 (토글 기능)
router.post('/toggle', (req, res) => {
  const { question_id, user_id, scrapped } = req.body;

  const checkScrapQuery = `SELECT * FROM scraps WHERE question_id = ? AND user_id = ?`;
  const insertScrapQuery = `INSERT INTO scraps (question_id, user_id) VALUES (?, ?)`;
  const deleteScrapQuery = `DELETE FROM scraps WHERE question_id = ? AND user_id = ?`;

  connection.query(checkScrapQuery, [question_id, user_id], (error, results) => {
    if (error) {
      console.error('스크랩 확인 오류:', error);
      return res.status(500).json({ success: false, message: '스크랩 확인 오류' });
    }

    if (results.length > 0) {
      // 이미 스크랩이 있는 경우
      if (scrapped) {
        // 스크랩 취소
        connection.query(deleteScrapQuery, [question_id, user_id], (deleteError) => {
          if (deleteError) {
            console.error('스크랩 취소 오류:', deleteError);
            return res.status(500).json({ success: false, message: '스크랩 취소 오류' });
          }

          return res.json({ success: true, scrapped: false });
        });
      } else {
        // 스크랩 이미 있는 상태로 오류 반환
        return res.json({ success: false, message: '이미 스크랩 상태입니다.' });
      }
    } else {
      // 스크랩이 없는 경우
      if (!scrapped) {
        // 스크랩 추가
        connection.query(insertScrapQuery, [question_id, user_id], (insertError) => {
          if (insertError) {
            console.error('스크랩 추가 오류:', insertError);
            return res.status(500).json({ success: false, message: '스크랩 추가 오류' });
          }

          return res.json({ success: true, scrapped: true });
        });
      } else {
        // 스크랩이 없는 상태로 오류 반환
        return res.json({ success: false, message: '스크랩이 없는 상태입니다.' });
      }
    }
  });
});

module.exports = router;
