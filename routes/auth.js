const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

let connectDB = require('../database');
const initializePassport = require('../config/passport');

let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => {
  db = client.db('board');
  initializePassport(db);
}).catch((err) => {
  console.log(err);
})

// 로그인
router.get('/login', (req, res) => {
  //console.log(req.user)
  res.render('login.ejs');
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json(err)
    if (!user) return res.status(401).json(info.message)

    req.logIn(user, (err)=>{
      if (err) return next(err)
      res.redirect('/');
    })
  })(req, res, next) 
});

router.get('/logout', (req, res) => {
  //console.log(req.user)
  req.logout((err) => { // passport 0.6.0부터 콜백함수 필요
    if (err) return next(err);
    req.session.destroy((err)=>{
      if (err) return next(err);
      res.redirect('/');
    })
  });
});

// 회원가입
router.get('/register', (req, res)=>{
  res.render('register.ejs')
});

router.post('/register', async (req, res)=>{
  let hashing = await bcrypt.hash(req.body.password, 10); // 비번 암호화하기

  await db.collection('user').insertOne({
    username: req.body.username,
    password: hashing // 해싱
  });
  // username 빈칸?
  // 이미 있는 유저?
  // password 짧으면?

  res.redirect('/');
});

module.exports = router; 
