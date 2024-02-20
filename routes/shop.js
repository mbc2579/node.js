// 1. const router = require('express').Router()
// 2. app을 전부 router로 변경
// 3. module.exports = router
// 4. server.js에서 require => app.use(require('./routes/shop.js'))

const router = require('express').Router()


let connectDB = require('./../database.js')

let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
})



// router.get('/shop/shirts', (요청, 응답) => {
//     응답.send('셔츠파는 페이지')
//   })
  
// router.get('/shop/pants', (요청, 응답) => {
//     응답.send('바지파는 페이지')
//   })

// 위 코드와 같이 URL이 중복이 되는것을 축약할 수 있다.
// 중복되는 URL을 지우고 server.js => app.use('/shop', require('./routes/shop.js'))로 변경
router.get('/shirts', async(요청, 응답) => {
    await db.collection('post').find().toArray()
    응답.send('셔츠파는 페이지')
  })
  
router.get('/pants', (요청, 응답) => {
    응답.send('바지파는 페이지')
  })

module.exports = router