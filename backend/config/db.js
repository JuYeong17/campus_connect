const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'cc-db.c7coiiu4kmbn.ap-northeast-2.rds.amazonaws.com', // AWS RDS 엔드포인트
  user: 'root', // AWS RDS 사용자 이름
  password: '19921102', // AWS RDS 비밀번호
  database: 'campus_connect', // 연결할 데이터베이스 이름
  port: 3306 // 기본 MySQL 포트
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  else {
    // 접속시 쿼리를 보냅니다.
    connection.query("SELECT * FROM university", function(err, rows, fields) {
      console.log(rows); // 결과를 출력합니다!
    });
  }
});

module.exports = connection;