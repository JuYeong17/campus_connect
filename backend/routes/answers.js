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

// routes/answers.js
router.post('/select/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // ID of the user who is marking the answer

  connection.query('UPDATE answers SET is_selected = 1 WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Update points for the user who answered
    connection.query('SELECT user_id FROM answers WHERE id = ?', [id], (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const answerUserId = result[0].user_id;
      connection.query('UPDATE users SET points = points + 10 WHERE id = ?', [answerUserId], (error) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json({ success: true });
      });
    });
  });
});

module.exports = router;
