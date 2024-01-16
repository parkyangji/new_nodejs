const loginCheck = (req, res, next) => {
  // req.body, req.query ... 가능
  // next() 다음으로 이동
  //if (!req.user) res.send('로그인하세요');
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true; // 현재 로그인 상태를 템플릿 엔진에 전달
    res.locals.username = req.user.username;
  } else {
    res.locals.isAuthenticated = false;
    res.locals.username = null;
    //res.send('로그인하세요');
  }
  next();
}

module.exports = loginCheck;