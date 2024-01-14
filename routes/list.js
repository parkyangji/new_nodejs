const router = require('express').Router();
const { ObjectId } = require('mongodb');

let connectDB = require('../database');
const initializePassport = require('../config/passport');

let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => {
  db = client.db('board');
  initializePassport(db);
}).catch((err) => {
  console.log(err);
})

router.get('/list', async (req, res) => {
  //db.collection('post').insertOne({title: '어쩌구'})
  let result = await db.collection('post').find().toArray(); // db 내용을 가져오기
  //console.log(result) 
  res.render('list.ejs', { 글목록: result }) //응답은 1개만
});

router.get('/detail/:id', async (req, res) => {

  try {
    let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
    if (result === null) res.status(400).send('null');
    res.render('detail.ejs', { 정보: result });
  } catch (e) {
    //console.log(e)
    res.status(400).send('이상한 url 입력함');
  }
});

router.get('/edit/:id', async (req, res) => {
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
  res.render('edit.ejs', { 정보: result });
});

router.put('/edit', async (req, res) => {

  await db.collection('post').updateOne({ // updateMany도 있음
    _id: new ObjectId(req.body.id) // 필터링 코드 $gt, $gte, $ne ...도 있음
  }, {
    $set: { // $inc (기존값에 +/-) $mul (기존값에 x) $unset (필드값 삭제)
      title: req.body.title,
      content: req.body.content
    }
  })

  let result = await db.collection('post').find().toArray(); // db 내용을 가져오기
  res.render('list.ejs', { 글목록: result });
});

router.delete('/delete', async (req, res)=>{
  //console.log(req.query)

  await db.collection('post').deleteOne({_id : new ObjectId(req.query.id), user : new ObjectId(req.user._id)});
  // 삭제 성공됬을 때만 ui도 삭제되게 추가하기
  res.send('삭제완료'); // ajax 요청 사용시 .redirect, .render 안쓰는게 좋음
});


module.exports = router;