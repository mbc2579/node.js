// 1. node.js, Express 설치 및 셋팅

// express 라이브러리 사용 코드
const express = require('express') 
const res = require('express/lib/response')
const app = express()

// 웹페이지에 디자인파일(css) 등록하는 코드
// public 폴더에 있는 파일들을 html에서 사용 가능
app.use(express.static(__dirname + '/public'))


// 3. MongoDB와 서버 연결하기
// MongoBD를 연결하기 위한 코드
const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://sparta:qwer1234@cluster0.yxrieip.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  // 서버 띄어주는 코드
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  console.log(err)
})


// user가 main페이지에 접속 했을 때 hello world를 띄어줌
app.get('/', (요청, 응답) => {
    응답.send('hello world')
})

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

// 2. 웹페이지 보내주는 실습 (라우팅)

// user가 news페이지에 접속 했을 때 오늘 비옴을 띄어줌
// 함수 안에 함수가 들어있다면 안에 있는 함수는 콜백함수라고 한다.
app.get('/news', (요청, 응답) => { // =>는 function과 같은 의미
    응답.send('오늘 비옴')
})

// =>를 function으로 변경한 코드
// app.get('/news', function(요청, 응답) {
//     응답.send('오늘 비옴')
// })

// user가 shop페이지에 접속 했을 때 쇼핑 페이지입니다.를 띄어줌
app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑 페이지입니다.')
})

// user가 main페이지에 접속 했을 때 index.html 파일을 띄어줌
// __dirname은 현재 프로젝트 절대 경로를 뜻한다.
app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
})

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ


// 4. MongoDB에서 데이터 출력하기 (array / object 문법)

// await를 사용하기 위해서는 함수 앞에 async를 작성
// await은 정해진 곳만 붙일 수 있음 ex) Promise 뱉는 곳
app.get('/list', async(요청, 응답) => {
    let result = await db.collection('post').find().toArray() // 컬렉션의 모든 document 출력 하는 법
    console.log(result)
    응답.send(result)
})

// 첫 게시물의 제목만 뽑으려면?
// app.get('/list', async(요청, 응답) => {
//     let result = await db.collection('post').find().toArray() // 컬렉션의 모든 document 출력 하는 법
//     console.log(result[0].title)
//     응답.send('result[0].title')
// })