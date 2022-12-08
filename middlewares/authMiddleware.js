const jwt = require('jsonwebtoken');
const { Users } = require('../models');
require('dotenv').config();

// 유저 인증에 실패하면 403 상태 코드를 반환한다.
module.exports = async (req, res, next) => {
  try {
    // const cookies = req.cookies[process.env.COOKIE_NAME];
    const { authorization } = req.headers;
    // authType: 인증 타입
    // authToken: 인증 토큰
    const [authType, authToken] = (authorization || '').split(' ');
    // console.log('authMiddleware authType: ', authType);
    // console.log('authMiddleware authToken: ', authToken);

    if (!authToken) {
      res.status(403).send({
        errorMessage: '로그인이 필요한 기능입니다.',
      });
      return;
    }
    // Bearer: JWT 혹은 OAuth에 대한 토큰을 사용한다.
    // const [tokenType, tokenValue] = cookies.split(' ');
    // if (tokenType !== 'Bearer') {
    if (authType !== 'Bearer') {
      return res.status(403).send({
        errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.',
      });
    }

    // console.log('authToken: ', jwt.decode(authToken));
    const { userId } = jwt.verify(authToken, process.env.SECRET_KEY);

    await Users.findByPk(userId).then((user) => {
      // console.log('user: ', user);
      // res.locals.user
      // 이 미들웨어를 사용하는 라우터에서는 굳이 데이터베이스에서 사용자 정보를 가져오지 않게 할 수 있도록
      // express가 제공하는 안전한 변수에 담아두고 언제나 꺼내서 사용할 수 있게 작성
      res.locals.user = user; // locals: 특정 장소의
      next(); // 미들웨어 마치면 다음 미들웨어로 넘어가라
    });
  } catch (error) {
    return res.status(403).send({
      errorMessage: '로그인이 필요한 기능입니다.',
    });
  }
};
