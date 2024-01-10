const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodeOverride = require('method-override');

// 폴더안에 파일들을 html에서 사용가능
app.use(express.static(__dirname + '/public'));
//ejs 템플릿 연결
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 폼 태그에서 put, delete 요청 등 맘대로
app.use(methodeOverride('_method'));

const session = require('express-session');
const passport = require('passport');
const LocalStratege = require('passport-local');

app.use(passport.initialize());
app.use(session({
  secret : '비번', // 세션 id는 암호화해서 유저에게 보냄
  resave : false,  // 유저가 서버로 요청할 때마다 세션 갱신할건지
  saveUninitialized : false, // 로그인 안해도 세션 만들것인지
  cookie : { maxAge : 60 * 1000 * 60 } // 6000(1분) 1시간
}));
app.use(passport.session());

let db;
const url = 'mongodb+srv://parkyangji:rhdandnjs02@cluster0.2n908hd.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client) => {
  console.log('DB연결성공');
  db = client.db('board');
  app.listen(8080, () => {
    console.log('8080에서 서버 실행중')
  });
}).catch((err) => {
  console.log(err);
})

app.get('/', (req, res) => {
  //res.send('반갑다');
  //res.sendFile(__dirname + '/index.html');
  res.render('index.ejs');
});

app.get('/list', async (req, res) => {
  //db.collection('post').insertOne({title: '어쩌구'})
  let result = await db.collection('post').find().toArray(); // db 내용을 가져오기
  //console.log(result) 
  res.render('list.ejs', { 글목록: result }) //응답은 1개만
});

app.get('/write', (req, res) => {
  res.render('write.ejs');
});

app.post('/add', async (req, res) => {
  //console.log(req.body) //form에서 전송한 것

  try {
    if (req.body.title === '') {
      res.send('제목입력안했는데?')
    } else {

      await db.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content
      });

      res.redirect('/list'); // 유저를 다른 페이지로 이동시킴
    }
  } catch (e) {
    //console.log(e)
    res.status(500).send('서버에러남') // 에러시 에러코드 전송해주면 좋음
  }
});

app.get('/detail/:id', async (req, res) => {

  try {
    let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
    if (result === null) res.status(400).send('null');
    res.render('detail.ejs', { 정보: result });
  } catch (e) {
    //console.log(e)
    res.status(400).send('이상한 url 입력함');
  }
});

app.get('/edit/:id', async (req, res) => {
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
  res.render('edit.ejs', { 정보: result });
});

app.put('/edit', async (req, res) => {

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

app.delete('/delete', async (req, res)=>{
  //console.log(req.query)

  await db.collection('post').deleteOne({_id : new ObjectId(req.query.id)});
  res.send('삭제완료'); // ajax 요청 사용시 .redirect, .render 안쓰는게 좋음
});



passport.use(new LocalStratege(async (id, pa, cb) => {
  let result = await db.collection('user').findOne({ username : id });

  if (!result) {
    return cb(null, false, { message : '아이디 DB에 없음' })
  }

  if (result.password === pa) {
    return cb(null, result)
  } else {
    return cb(null, false, { message : '비번불일치' })
  }
}));

passport.serializeUser((user, done) => { //req.logIn() 쓰면 자동 실행됨.
  process.nextTick(()=>{ // 내부 코드를 비동기적으로 처리해줌
    done(null, { id : user._id, username : user.username }) // 쿠키도 보내줌
  })
});
passport.deserializeUser(async (user, done) => {  // 유저가 보낸 쿠키 분석
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id)});
  delete result.password

  process.nextTick(()=>{ 
    done(null, result)
  })
});


app.get('/login', (req, res) => {
  //console.log(req.user)
  res.render('login.ejs');
});

app.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json(err)
    if (!user) return res.status(401).json(info.message)

    req.logIn(user, (err)=>{
      if (err) return next(err)
      res.redirect('/');
    })
  })(req, res, next) 
})