const router = require('express').Router();

let connectDB = require('../database');
const initializePassport = require('../config/passport');

let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => {
  db = client.db('board');
  initializePassport(db);
}).catch((err) => {
  console.log(err);
})

router.get('/search', async (req, res)=>{
  //console.log(req.query.val)
  // 1. 정확한 것만 찾아옴
  /*
  let result = await db.collection('post').find({ title : req.query.val }).toArray();
  res.render('search.ejs', { 검색결과 : result });
  */

  // 2. 일부만 검색해도 가능 but 느려터짐
  /* 정규식
  let result = await db.collection('post').find({ title : { $regex : req.query.val} }).toArray();
  res.render('search.ejs', { 검색결과 : result });
  */

  // 3. 인덱스이용 but 정확한 단어만 찾아옴, 띄어쓰기로 단어를 구분하기 때문
  /*
  let result = await db.collection('post').find({ $text : { $search : req.query.val} }).toArray();
  console.log(result)
  res.render('search.ejs', { 검색결과 : result });
  */

  // 4. search index, 문자에서 조사,불용어 제거, 모든 단어 정렬함
  let 검색조건 = [  // 설정에 한글로 검색조거 되어있음
    {$search : {
      index : 'titleIndex',
      text : { query : req.query.val, path : 'title' }
    }},
    // {} 조건 여러개 가능 $skip(건너뛰기), $limet(제한)
    {$sort : { _id : 1 }}, // _id 순으로 오름차순
    {$limit : 10}
  ]
  let result = await db.collection('post').aggregate(검색조건).toArray()
  res.render('search.ejs', { 검색결과 : result })
});

module.exports = router;