let express = require('express')
let app = express()

app.use('/js', express.static('./game/lib'))
app.use('/content', express.static('./game/content'))
app.set('port', process.env.PORT || 3000)

//app.use('/', createRouter)
//app.use('/game', gameRouter)

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/game/game.html')
})

app.get('*', function(req, res){
	res.status(404).end('404 page not found')
})

app.listen(app.get('port'), function () {
	console.log('listen on port ' + app.get('port'))
})
