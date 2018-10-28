const express = require('express')
const path    = require('path')
const router  = express.Router()

router.use('/game', require('./game.js'))
// else we are in the lobby (creating a game or something like that)
router.get('/', (req, res) => {
  // res.sendFile
})



module.exports = router
