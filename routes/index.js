const express = require('express');
const router = express.Router();

//! 1. 라우터가 연결되어 있지 않습니다.
//! 2. 각 라우터마다 사용될 공통의 url 주소를 설정합니다.
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const loginsRouter = require('./login');
const signupRouter = require('./signup');
const likesRouter = require('./likes');

router.get('/', (req, res) => {
  console.log('req: ', req.headers);
  res.send('Wellcome to test-API');
});

// 동일한 url이 앞에 있으면, 배치 순서도 중요함
router.use('/posts', likesRouter);
router.use('/posts', postsRouter);
router.use('/login', loginsRouter);
router.use('/comment', commentsRouter);
router.use('/signup', signupRouter);

module.exports = router;
