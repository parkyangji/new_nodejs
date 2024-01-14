const loginCheck = (req, res, next) => {
  // req.body, req.query ... 가능
  // next() 다음으로 이동
  if (!req.user) res.send('로그인하세요');
  next();
}

module.exports = loginCheck;