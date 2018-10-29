const express     = require('express')
const session     = require('express-session')
const dotenv      = require('dotenv')
const http        = require('http')
const path        = require('path')
const app    = express()
const server = http.createServer(app)

module.exports = server
// init the websocket server
dotenv.config()

app.enable('strict-routing') // because I care ^^

// set
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10000 // 10s
  }
}))

app.use('/', require('./routes/index.js'))

server.listen(process.env.PORT, function () {
  console.log('running on ' + process.env.PORT)
})
