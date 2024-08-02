const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/users');
const universityRoutes = require('./routes/university');
const categoryRoutes = require('./routes/categories');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const authRoutes = require('./routes/auth');
const pointsRoutes = require('./routes/points');
const connection = require('./config/db'); // MySQL 데이터베이스 연결 가져오기

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/university', universityRoutes); // 대학 관련 라우트
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes); // 질문 관련 라우트
app.use('/api/answers', answerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = connection;
