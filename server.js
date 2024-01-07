const express = require('express');
const app = express();

// 폴더안에 파일들을 html에서 사용가능
app.use(express.static(__dirname + '/public'));

app.listen(8080, ()=>{
  console.log('8080에서 서버 실행중')
});

app.get('/', (req, res) => {
  //res.send('반갑다');
  res.sendFile(__dirname + '/index.html');
});