const express = require('express')
const path    = require('path')
const router  = express.Router()

// else we are in the lobby (creating a game or something like that)

router.get('/connect/:id', (req, res) => {
  req.session.roomid = req.params.id
  res.redirect('/')
}) // one page app!


router.get(/\/credits?/i, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../credit.md'))
})
router.use('/', require('./game.js'))

router.get('*', (req, res) => {
  res.end('404 not found')
})


module.exports = router
