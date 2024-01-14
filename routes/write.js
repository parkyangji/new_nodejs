const router = require('express').Router();
const loginCheck = require('../config/middleware');

let connectDB = require('../database');
const initializePassport = require('../config/passport');

let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => {
  db = client.db('board');
  initializePassport(db);
}).catch((err) => {
  console.log(err);
})

          // 미들웨어 여러개 넣기 가능 [함수1, 함수2, 함수3]
router.get('/write', loginCheck, (req, res) => {
  res.render('write.ejs');
});

router.post('/add', async (req, res) => {
  //console.log(req.body) //form에서 전송한 것

  try {
    if (req.body.title === '') {
      res.send('제목입력안했는데?')
    } else {

      await db.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content,
        user : req.user._id,
        username : req.user.username
      });

      res.redirect('/list'); // 유저를 다른 페이지로 이동시킴
    }
  } catch (e) {
    //console.log(e)
    res.status(500).send('서버에러남') // 에러시 에러코드 전송해주면 좋음
  }
});

module.exports = router;