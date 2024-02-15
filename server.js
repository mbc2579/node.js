// 1. node.js, Express 설치 및 셋팅

// express 라이브러리 사용 코드
const express = require('express') 
const res = require('express/lib/response')
const app = express()
// 3. MongoDB와 서버 연결하기
// MongoBD를 연결하기 위한 코드
const {MongoClient, ObjectId} = require('mongodb'); // ObjectId 추가 코드

// 웹페이지에 디자인파일(css) 등록하는 코드
// public 폴더에 있는 파일들을 html에서 사용 가능
app.use(express.static(__dirname + '/public'))
// ejs를 사용하기 위한 코드
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))


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
// app.get('/list', async(요청, 응답) => {
//     let result = await db.collection('post').find().toArray() // 컬렉션의 모든 document 출력 하는 법
//     console.log(result)
//     응답.send(result)
// })

// 첫 게시물의 제목만 뽑으려면?
// app.get('/list', async(요청, 응답) => {
//     let result = await db.collection('post').find().toArray() // 컬렉션의 모든 document 출력 하는 법
//     console.log(result[0].title)
//     응답.send('result[0].title')
// })

// 5. 웹체이지에 DB데이터 넣기 (EJS, 서버사이드 렌더링)
app.get('/list', async(요청, 응답) => {
  let result = await db.collection('post').find().toArray() // 컬렉션의 모든 document 출력 하는 법
  // console.log(result[0].title)

  // 유저에게 ejs파일 보내는 법
  // 응답.render('list.ejs') // ()안에는 경로를 ejs파일의 경로를 작성

  // 서버 데이터를 ejs파일에 넣으려면?
  // 1. ejs파일로 데이터 전송
  // 2. ejs파일 안에서 <%=데이터이름%>
  응답.render('list.ejs', {posts : result})
})

app.get('/write', (요청, 응답) => {
      응답.render('write.ejs')
  })

app.post('/add', async(요청, 응답) => {

  try {
    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send('제목 또는 내용을 입력해주세요.')
    } else {
      await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content})
      응답.redirect('/list')
    }
  } catch(e) {
      응답.status(500).send('서버에러')
  }
})

app.get('/detail/:id', async(요청, 응답)=> {

  try {
    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)})
    응답.render('detail.ejs', {result : result})
  } catch(e) {
    응답.status(400).send('url을 잘못 입력하셨습니다.')
  }
})