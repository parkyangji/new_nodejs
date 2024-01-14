const router = require('express').Router();
const loginCheck = require('../config/middleware');
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

router.get('/board/sub/sports', loginCheck, (요청, 응답) => {
  응답.send('스포츠 게시판')
})

module.exports = router; // server.js로 보냄