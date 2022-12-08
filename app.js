const express = require('express');
const Http = require('http');
const routes = require('./routes');
require('dotenv').config();
// db 연결
const db = require('./models');
// 에러 로깅을 위함
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const http = Http.createServer(app);
const port = process.env.EXPRESS_PORT || 3000;

// db 연결 확인
db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

// sequelize model sync() 수정하기
db.sequelize.sync({
  alter: true,
});

// 에러 확인을 위한 설정, 요청과 응답을 기록하는 모듈 (development)
app.use(morgan('dev')); // 간단
app.use(morgan('combined')); // 상세

app.use(cookieParser());
// body에 실린 데이터를 원활히 읽기 위한 미들웨어 사용, post, put 전달된 body 데이터를 req.body로 사용할 수 있도록 만든 bodyparser
app.use(express.json());
// content type이 urlencoded type의 경우 parser 해준다
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

http.listen(port, () => {
  console.log(`Start listen Server: ${port}`);
});

module.exports = http;
