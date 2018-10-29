const express = require('express')
const path    = require('path')
const router  = express.Router()
const server = require('./websocket.server.js')

server.init()


router.use('/js', express.static(path.resolve(__dirname, '../dist/lib')))
router.use('/css', express.static(path.resolve(__dirname, '../dist/css')))
router.use('/content', express.static(path.resolve(__dirname, '../dist/content')))

let k = 0
router.use('/', (req, res, next) => {
  if (!req.session.roomid) {
    // the host
    req.session.roomid = k //Math.random() + new Date().getTime()
    k++
  }
  next()
})
// have both names at this point !
router.get('/', (req, res) => {
  // res.sendFile(path.resolve(__dirname, '../dist/game/game.html'))
  res.render('game', {
    title: 'Cowboy vs Cowboy', // put in names instead !,
    id: req.session.roomid
  })
})

module.exports = router
