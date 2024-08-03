const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// 모든 답변 가져오기
router.get('/', (req, res) => {
  connection.query('SELECT * FROM answers', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

router.get('/question/:questionId', (req, res) => {
  const { questionId } = req.params; // URL 파라미터에서 questionId를 가져옵니다.

  connection.query('SELECT * FROM answers WHERE question_id = ?', [questionId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 답변 추가
router.post('/', (req, res) => {
  const answer = req.body;

  // Validate input data
  if (!answer.content || !answer.question_id || !answer.user_id || !answer.answers_nickname) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  connection.query('INSERT INTO answers SET ?', answer, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ id: results.insertId, ...answer });
  });
});

// 특정 답변 가져오기
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM answers WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results[0]);
  });
});

// 답변 업데이트
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const answer = req.body;
  connection.query('UPDATE answers SET ? WHERE id = ?', [answer, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 답변 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM answers WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// 답변 채택
router.post('/:id/select', (req, res) => {
  const { id } = req.params;
  connection.query('UPDATE answers SET is_selected = TRUE, selected_at = NOW() WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    // 답변을 채택한 유저에게 포인트를 추가합니다.
    connection.query('UPDATE users SET points = points + 10 WHERE id = (SELECT user_id FROM answers WHERE id = ?)', [id], (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json({ success: true });
    });
  });
});
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT a.*, q.title AS question_title 
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.user_id = ?
  `;
  
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user answers:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});
module.exports = router;
