const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 질문 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM questions', (error, results) => {
    if (error) {
      console.error('Error fetching questions:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 특정 user_id를 가진 모든 질문 가져오기
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  console.log(user_id);
  connection.query('SELECT * FROM questions WHERE user_id = ?', [user_id], (error, results) => {
    if (error) {
      console.error('Error fetching questions by user_id:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 특정 category_id를 가진 모든 질문 가져오기
router.get('/category/:category_id', (req, res) => {
  const { category_id } = req.params;
  connection.query('SELECT * FROM questions WHERE category_id = ?', [category_id], (error, results) => {
    if (error) {
      console.error('Error fetching questions by category:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 질문 추가
router.post('/', (req, res) => {
  const question = req.body;
  connection.query('INSERT INTO questions SET ?', question, (error, results) => {
    if (error) {
      console.error('Error adding question:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    // 삽입된 질문의 ID를 반환
    const insertedId = results.insertId; // 자동 생성된 ID를 가져옴
    res.status(201).json({ id: insertedId, ...question });
  });
});

router.get('/user/posts/:user_id', (req, res) => {
  const { user_id } = req.params;

  // 사용자가 작성한 질문 또는 사용자가 답변한 질문 가져오기
  const query = `
    SELECT DISTINCT q.*
    FROM questions q
    LEFT JOIN answers a ON q.id = a.question_id
    WHERE q.user_id = ? OR a.user_id = ?;
  `;

  connection.query(query, [user_id, user_id], (error, results) => {
    if (error) {
      console.error('사용자 관련 질문 가져오기 오류:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 특정 질문 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM questions WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error fetching question by id:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 질문 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const question = req.body;
  connection.query('UPDATE questions SET ? WHERE id = ?', [question, id], (error, results) => {
    if (error) {
      console.error('Error updating question:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 질문 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM questions WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error deleting question:', error); // 로그 추가
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// Get questions authored by user or questions answered by user
router.get('/user/posts/:user_id', (req, res) => {
  const { user_id } = req.params;
  // SQL query to fetch questions authored by user or questions answered by user
  const query = `
    SELECT DISTINCT q.*
    FROM questions q
    LEFT JOIN answers a ON q.id = a.question_id
    WHERE q.user_id = ? OR a.user_id = ?;
  `;

  connection.query(query, [user_id, user_id], (error, results) => {
    if (error) {
      console.error('Error fetching user-related questions:', error);
      return res.status(500).json({ error: error.message });
    }
    // Sending results in the response
    res.json(results);
  });
});

module.exports = router;
