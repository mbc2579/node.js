// 1. node.js, Express 설치 및 셋팅

// express 라이브러리 사용 코드
const express = require('express') 
const res = require('express/lib/response')
const app = express()
// 3. MongoDB와 서버 연결하기
// MongoBD를 연결하기 위한 코드
const {MongoClient, ObjectId} = require('mongodb'); // ObjectId 추가 코드
const methodOverride = require('method-override') // methodOverride 셋팅 코드 form태그에서 put, delete 등을 사용할 수 있게해줌
const bcrypt = require('bcrypt') // bcrypt 셋팅 코드

// socket.io 라이브러리 셋팅 코드
const { createServer } = require('http')
const { Server } = require('socket.io')
const server = createServer(app)
const io = new Server(server) 

app.use(methodOverride('_method')) // methodOverride 셋팅 코드 form태그에서 put, delete 등을 사용할 수 있게해줌

// 웹페이지에 디자인파일(css) 등록하는 코드
// public 폴더에 있는 파일들을 html에서 사용 가능
app.use(express.static(__dirname + '/public'))
// ejs를 사용하기 위한 코드
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// passport라이브러리 셋팅 코드
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo') // connect-mongo 셋팅 코드
require('dotenv').config()

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', // 암호에 쓸 비번 (세션의 document id는 암호화해서 유저에게 보냄)
  resave : false,           // 유저가 서버로 요청할 때 마다 세션을 갱신할건지 보통은 false
  saveUninitialized : false, // 로그인 안해도 세션을 만들것인지 보통은 false
  cookie : {maxAge : 60 * 60 * 1000}, // 세션 document 유효기간 변경 가능 현재 1시간
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL, // DB접속용 URL~~
    dbName : 'forum' // 세선 저장할 db이름
  })
}))

app.use(passport.session()) 


const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEY,
      secretAccessKey : process.env.S3_SECRET,
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'node.forum',
    key: function (요청, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능
    }
  })
})

let connectDB = require('./database.js');
const { patch } = require('./routes/shop.js');

let db
let changeStream
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')

  // insert 되는 경우만 감지하고 싶을 때
  let 조건 = [ { $match : { operationType : 'insert' } }]

  // fullDocument의 title가 ~~인 것들만 감지하고 싶을 때
  let 조건2 = [ { $match : { 'fullDocument.title' : '안녕하십니까' } }]

  // post 컬렉션의 document생성/수정/삭제시 (변동사항이 생길때 마다)
  changeStream = db.collection('post').watch(조건)

  // 서버 띄어주는 코드
  server.listen(process.env.PORT, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  console.log(err)
})


// user가 main페이지에 접속 했을 때 hello world를 띄어줌
// app.get('/', (요청, 응답) => {
//     응답.send('hello world')
// })

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

function checkLogin(요청, 응답, next) {
  if(!요청.user) {
    응답.send('로그인하세요')
  }
  next() // 미들웨어 실행코드 끝났으니 다음으로 이동하라는 코드 없으면 무한대기 상태
}

// 여기 밑에있는 모든 API는 checkLogin미들웨어가 적용됨
// 제한사항도 넣을 수 있음 ex) URL이 일치하는 API만 적용하고 싶을 때
// app.use('/URL'checkLogin)
// app.use(checkLogin)


// user가 main페이지에 접속 했을 때 index.html 파일을 띄어줌
// __dirname은 현재 프로젝트 절대 경로를 뜻한다.
// 미들웨어를 사용하게 되면 get요청 후 미들웨어 코드를 먼저 실행하고 아래 코드를 실행
// 미들웨어 여러개 넣을라면 [함수1, 함수2, 함수3 ....]
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

  // name = "img1" 가진 이미지가 들어오면 S3에 자동 업로드해줌
  // upload.single은 이미지 1장 upload.array는 이미지 여러장 숫자 2는 이미지 최대 숫자 지정
app.post('/add', upload.single('img1'), async(요청, 응답) => {

  // 업로드 완료시 이미지의 URL도 생성해줌
  // console.log(요청.file.location)
  try {
    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send('제목 또는 내용을 입력해주세요.')
    } else {
      await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content, img : 요청.file ? 요청.file.location : '', user : 요청.user._id, username : 요청.user.username})
      응답.redirect('/list')
    }
  } catch(e) {
      응답.status(500).send('서버에러')
  }
})

app.get('/detail/:id', async(요청, 응답)=> {

  try {
    let result2 = await db.collection('comment').find({parentId : new ObjectId(요청.params.id)}).toArray()
    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)})
    응답.render('detail.ejs', {result : result, result2 : result2})
  } catch(e) {
    응답.status(400).send('url을 잘못 입력하셨습니다.')
  }
})

app.get('/edit/:id', async(요청, 응답)=> {

  // db.collection('post').updateOne({}, {$set : {}})

  let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)})
  console.log(result)
  응답.render('edit.ejs', {result : result})
})

app.put('/edit', async(요청, 응답)=> {

  // updateOne() 추가 사용법
  // $set은 덮어쓰게 됨 
  // $inc는 기존값에 +/-하게됨
  // $mul은 기존값에 x하게 됨
  // $unset은 필드값 삭제
  // await db.collection('post').updateOne({_id : 1}, {$set : {like : 2}}) 
  // 응답.redirect('/list')

  // 동시에 여러개의 document를 수정하기 위해서는 updateOne이 아닌 updateMany 사용
  // await db.collection('post').updateMany({_id : 1}, {$set : {like : 2}}) 
  // 응답.redirect('/list')

  // 특정 조건에 맞는 document를 찾아오고 싶을 때
  // ex) like 항목이 10이상인 document 전부 수정하고 싶음 
  // $gt는 ~~보다 큰, $gte는 ~~이상, $lt는 ~~보다 작은, $lte는 ~~이하, $ne는 ~~랑 같지 않다
  // await db.collection('post').updateMany({like : {$gt : 10}}, {$set : {like : 2}}) 
  // 응답.redirect('/list')


  await db.collection('post').updateOne({_id : new ObjectId(요청.body.id)}, {$set : {title : 요청.body.title, content : 요청.body.content}})
  응답.redirect('/list')
})

app.delete('/delete', async (요청,응답) => {
  console.log(요청.query)
  await db.collection('post').deleteOne({_id : new ObjectId(요청.query.docid), user : new ObjectId(요청.user._id)})
  응답.send('삭제완료')
})

// limit을 사용하면 처음부터 5개를 출력

// app.get('/list/1', async (요청, 응답) => {
//   let result = await db.collection('post').find().limit(5).toArray()
//   응답.render('list.ejs', { posts : result})
// })

// skip(5)를 사용하면 앞에 5개를 스킵하고 6 ~ 10까지 출력

// app.get('/list/2', async (요청, 응답) => {
//   let result = await db.collection('post').find().skip(5).limit(5).toArray()
//   응답.render('list.ejs', { posts : result})
// })

// skip(10)을 사용하면 앞에 10개를 스킵하고 11 ~ 15까지 출력

// app.get('/list/3', async (요청, 응답) => {
//   let result = await db.collection('post').find().skip(10).limit(5).toArray()
//   응답.render('list.ejs', { posts : result})
// })


app.get('/list/:id', async (요청, 응답) => {
  let result = await db.collection('post').find().skip((요청.params.id - 1) * 5).limit(5).toArray()
  응답.render('list.ejs', { posts : result})
})

app.get('/list/next/:id', async (요청, 응답) => {
  let result = await db.collection('post').find({_id : {$gt : new ObjectId(요청.params.id)}}).limit(5).toArray()
  응답.render('list.ejs', { posts : result})
})

// 제출한 아이디 / 비번 검사하는 코드
// 아래 코드를 실행하고 싶으면 passport.authenticate('local')() 사용 
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' }) // 회원인증 실패시 false를 넣어줌
  }
  if (await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' }); // 회원인증 실패시 false를 넣어줌
  }
}))

// 유저가 로그인 시 세션을 부여해주는 passport라이브러리 코드 serializeUser()
passport.serializeUser((user, done) => {
  // 내부 코드를 비동기적으로 처리해줌 queueMicrotask()랑 유사
  process.nextTick(() => {
    done(null, {id : user._id, username : user.username}) // 세션document에 기록할 내용
  })
})

// 유저가 보낸 쿠키 분석 코드 deserializeUser()
// 문제점 : 세션 document에 적힌 유저정보를 그대로 요청.user에 담아줌 이렇게 되면 오래된 데이터와 최신 데이터가 다를 수 있음
// passport.deserializeUser((user, done) => {
//   process.nextTick(() => {
//     done(null, user)
//   })
// })

// 위 코드의 문제점을 해결하기 위해 db에서 유저의 최신 정보를 먼저 가져온 후 요청.user에 넣어줌
passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
  delete result.password // 유정 정보의 비밀번호는 삭제 후 넣기 위해 작성한 코드
  process.nextTick(() => {
    done(null, result)
  })
}) 

app.get('/login', async (요청, 응답) => {
  console.log(요청.user)
  응답.render('login.ejs')
})

app.post('/login', async (요청, 응답, next) => {
  // 비교 작업시에 에러가 났을 때는 error에 에러 값이 들어옴
  // 비교 작업시에 성공했을 때는 user에 성공시 로그인한 유저정보 값이 들어옴
  // 비교 작업시에 실패했을 때는 info에 실패시 이유가 들어옴
  passport.authenticate('local', (error, user, info) => {
      if(error) return 응답.status(500).json(error) // 비교 작업시 에러
      if(!user) return 응답.status(401).json(info.message) // 비교 작업시 실패
      요청.logIn(user, (err) => { // 비교 작업시 성공
        if (err) return next(err)
        응답.redirect('/')
    })
  })(요청, 응답, next)
  
})

app.get('/register', (요청, 응답) => {
  응답.render('register.ejs')
})

app.post('/register', async(요청, 응답) => {
  let password = await bcrypt.hash(요청.body.password, 10)

  await db.collection('user').insertOne({username : 요청.body.username, password : password})
  응답.redirect('/')
})

// 공통된 URL 축약 /shop 부분에 축양할 공통된 URL작성
app.use('/shop', require('./routes/shop.js'))


// find와 index의 성능 평가하는 코드
app.get('/search', async (요청, 응답) => {
  console.log(요청.query.val)

  let 검색조건 = [
    {$search : {
      index : 'title_index',
      text : { query : 요청.query.val, path : 'title' }
    }}
    // {$sort : { _id : 1}}, // 결과 정렬
    // {$limit : 10}, // 결과수 제한
    // {$skip : 10},   // 건너뛰기
    // {$project : { title : 1}} // 필드 숨기기
  ]

  // let result = await db.collection('post').find({$text : {$search : 요청.query.val}}).explain('executionStats')
  // console.log(result)
  let result = await db.collection('post').aggregate(검색조건).toArray()
  응답.render('search.ejs', {posts : result})
})

app.post('/comment', async (요청, 응답) => {
  await db.collection('comment').insertOne({
    content : 요청.body.content,
    writerId : new ObjectId(요청.user._id),
    writer : 요청.user.username,
    parentId : new ObjectId(요청.body.parentId)
  })
  응답.redirect('back')
})

// 타입 힌드주기 (JSDoc)
/** @type { {title : string, content : string } } */
// let result = await db.collection('post').findOne({title : '하이'})

// Node+Express 서버와 React연동하는 코드
// React파일을 따로 만들지 않아서 코드만 작성

// const express = require('express')
// const app = express()
// const path = require('path')

// app.listen(8080, function() {
//   console.log('listening on 8080')
// })

// app.use(express.json());
// var cors = require('cors');
// app.use(cors());

// app.use(express.static(path.join(__dirname, 'react-project/build')));

// app.get('/', function(요청, 응답) {
//   응답.sendFile(path.join(__dirname, '리액트로만든html파일경로'));
// })

// DB데이터를 리액트에서 보여주고 싶을 때
// html을 서버가 만들면 server-side rendering
// html을 리액트가 만들면client-side rendering
// app.get('/product', function(요청, 응답) {
//   응답.json({name : 'black shoes'})
// })


// 리액트라우터 쓰는 경우 사용 코드 아래에 작성해 놓으면 좋음
// app.get('*', function(요청, 응답) {
  // 응답.sendFile(path.join(__dirname, 'react-project/build/index.html'));
// })

app.get('/chat/request', async (요청, 응답)=> {
  await db.collection('chatroom').insertOne({
    member : [요청.user._id, new ObjectId(요청.query.writerId)],
    date : new Date()
  })
  응답.redirect('/chat/list')
})

app.get('/chat/list', async (요청, 응답)=> {
  let result = await db.collection('chatroom').find({
    member : 요청.user._id
  }).toArray()
  응답.render('chatList.ejs', {result : result})
})

app.get('/chat/detail/:id', async (요청, 응답)=> {
  let result = await db.collection('chatroom').findOne({_id : new ObjectId(요청.params.id)})
  응답.render('chatDetail.ejs', {result : result})
})

// 유저가 웹소켓 연결시 서버에서 코드 실행
io.on('connection', (socket)=> {
  socket.on('age', (data)=> {
    console.log('유저가 보낸거 : ', data)

    // 서버 -> 모든 유저에게 데이터 전송
    io.emit('name', 'kim')
  })

  socket.on('ask-join', (data)=> {
    socket.join(data)
  })

  socket.on('message-send', (data)=> {
    // console.log(data)
    io.to(data.room).emit('message-broadcast', data.msg)
  })
})

app.get('/stream/list', (요청, 응답) => {
  응답.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  })

  // 자바스크립트에서 1초마다 특정 코드를 실행하고 싶을 때 쓰는 함수
  // setInterval(()=> {
  //   응답.write('event: msg\n')
  //   응답.write('data: 바보\n\n')
  // }, 1000)


  
  changeStream.on('change', (result)=> {
    // console.log(result) // 전체 document내용
    console.log(result.fullDocument) // 방금 추가된 document 내용이 궁금할 때
    응답.write('event: msg\n')
    응답.write(`data: ${JSON.stringify(result.fullDocument)}\n\n`)
  })
})
