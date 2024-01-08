const express = require('express');
const app = express();

// 폴더안에 파일들을 html에서 사용가능
app.use(express.static(__dirname + '/public'));

const { MongoClient } = require('mongodb');

let db;
const url = 'mongodb+srv://parkyangji:rhdandnjs02@cluster0.2n908hd.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client) => {
  console.log('DB연결성공');
  db = client.db('board');
}).catch((err)=>{
  console.log(err);
})

app.listen(8080, ()=>{
  console.log('8080에서 서버 실행중')
});

app.get('/', (req, res) => {
  //res.send('반갑다');
  res.sendFile(__dirname + '/index.html');
});