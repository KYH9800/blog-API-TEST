require('dotenv').config();

// 로그인 되어 있는 유저일 경우 Error를 반환한다.
module.exports = (req, res, next) => {
  try {
    // const cookies = req.cookies[process.env.COOKIE_NAME];
    // 로그인을 통해 jwt 인증을 받고 나면 req.headers에 authorization이 담긴다.
    // authorization 안에 Bearer token을 확인하고 있다면, 로그인이 된 상태
    const { authorization } = req.headers;
    // authType: 인증 타입
    // authToken: 인증 토큰
    const [authType, authToken] = (authorization || '').split(' ');
    // console.log('authType: ', authType);
    // console.log('authToken: ', authToken);

    // Bearer: JWT 혹은 OAuth에 대한 토큰을 사용한다.
    if (authType === 'Bearer' || authToken) {
      res.status(403).send({
        errorMessage: '이미 로그인이 되어있습니다.',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
    return res.status(400).send({
      errorMessage: '잘못된 접근입니다.',
    });
  }
};
