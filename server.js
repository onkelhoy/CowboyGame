const express     = require('express')
const session     = require('express-session')
const dotenv      = require('dotenv')
const http        = require('http')
const app    = express()
const server = http.createServer(app)

// init the websocket server
require('./routes/websocket.server.js')(server)
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
    maxAge: 300000 // 5min
  }
}))

app.use('/', require('./routes/index.js'))

server.listen(process.env.PORT, function () {
  console.log('running on ' + process.env.PORT)
})
