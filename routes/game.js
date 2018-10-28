const express = require('express')
const path    = require('path')
const router  = express.Router()


router.use('/js', express.static(path.resolve(__dirname, '../dist/game/lib')))
router.use('/content', express.static(path.resolve(__dirname, '../dist/game/content')))

router.use('/', (req, res, next) => {
  if (req.session.game) next()
  else res.redirect('/')
})
// have both names at this point !
router.get('/', (req, res) => {
  // res.sendFile(path.resolve(__dirname, '../dist/game/game.html'))
  res.render('game', {
    title: 'A vs B' // put in names instead !
  })
})

module.exports = router
