const router = require('express').Router();
/*
let connectDB = require('./../database');

let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => { 
  console.log('DB연결성공');
  db = client.db('board');
}).catch((err) => {
  console.log(err);
})
*/

function loginCheck(req, res, next){
  // req.body, req.query ... 가능
  // next() 다음으로 이동
  if (!req.user) res.send('로그인하세요');
  next();
}

router.get('/board/sub/sports', loginCheck, (요청, 응답) => {
  응답.send('스포츠 게시판')
})

module.exports = router; // server.js로 보냄