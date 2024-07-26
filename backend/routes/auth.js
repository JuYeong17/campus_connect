const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 사용자 로그인
router.post('/login', (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
  }

  const query = 'SELECT * FROM users WHERE user_id = ? AND password = ?';
  connection.query(query, [user_id, password], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      res.json({ message: '로그인 성공', user: results[0] });
    } else {
      res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
  });
});

module.exports = router;