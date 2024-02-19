// 1. node.js, Express 설치 및 셋팅

// express 라이브러리 사용 코드
const express = require('express') 
const res = require('express/lib/response')
const app = express()
// 3. MongoDB와 서버 연결하기
// MongoBD를 연결하기 위한 코드
const {MongoClient, ObjectId} = require('mongodb'); // ObjectId 추가 코드
const methodOverride = require('method-override') // methodOverride 셋팅 코드 form태그에서 put, delete 등을 사용할 수 있게해줌

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

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', // 암호에 쓸 비번 (세션의 document id는 암호화해서 유저에게 보냄)
  resave : false,           // 유저가 서버로 요청할 때 마다 세션을 갱신할건지 보통은 false
  saveUninitialized : false // 로그인 안해도 세션을 만들것인지 보통은 false
}))

app.use(passport.session()) 



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
  await db.collection('post').deleteOne({_id : new ObjectId(요청.query.docid)})
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
  if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' }); // 회원인증 실패시 false를 넣어줌
  }
}))

app.get('/login', async (요청, 응답) => {
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