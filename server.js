const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodeOverride = require('method-override');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// 폴더안에 파일들을 html에서 사용가능
app.use(express.static(__dirname + '/public'));
//ejs 템플릿 연결
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 폼 태그에서 put, delete 요청 등 맘대로
app.use(methodeOverride('_method'));


app.use(passport.initialize());
app.use(session({
  secret : '비번', // 세션 id는 암호화해서 유저에게 보냄
  resave : false,  // 유저가 서버로 요청할 때마다 세션 갱신할건지
  saveUninitialized : false, // 로그인 안해도 세션 만들것인지
  cookie : { maxAge : 60 * 1000 * 60 }, // 6000(1분) 1시간
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,// DB접속 URL
    dbName : 'board' //DB이름
  })
}));
app.use(passport.session());


const initializePassport = require('./config/passport');
let connectDB = require('./database');
const loginCheck = require('./config/middleware');

// 미들웨어 연결
app.use(loginCheck); // 로그인 상태에 따른 정보를 네비바에 전달하기 위함

// routes
app.use('/', require('./routes/write')); 
app.use('/', require('./routes/auth')); 
app.use('/', require('./routes/list')); 
app.use('/', require('./routes/search')); 


// db 연결
let db; // db 변수까지 export시키면 처리가 늦어짐
connectDB.then((client) => {
  console.log('DB연결성공');
  db = client.db('board');
  initializePassport(db);
  app.listen(process.env.PORT, () => {
    console.log('8080에서 서버 실행중')
  });
}).catch((err) => {
  console.log(err);
})


// 초기 화면
app.get('/', (req, res) => {
  //res.send('반갑다');
  //res.sendFile(__dirname + '/index.html');
  //res.locals.isAuthenticated = false;
  res.render('index.ejs');
});