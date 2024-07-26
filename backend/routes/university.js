const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/', (req, res) => {
  connection.query('SELECT * FROM university', (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      res.status(500).send('Database query failed');
      return;
    }
    res.json(results);
  });
});

module.exports = router;
