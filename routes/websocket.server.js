const WebSocket = require('ws')

let wss
module.exports = function (server) {
  wss = new WebSocket.Server({ server })
  wss.connections = 0
  setInterval(setPulse, 30000) // ping them every 30s

  // client socket connected to our server !
  wss.on('connection', socket => {
    wss.connections++
    socket.id = new Date().getTime() + Math.random()
    socket.onclose = disconnect.bind(null, socket)

    console.log('connected', socket.id)
    console.log('current connections', wss.connections)
    send(socket, { type: 'ack', ack: 'connection', id: socket.id })
    socket.on('message', data => {
      data = JSON.parse(data)


      switch (data.type) {
        case 'ping':
          socket.ping_status = true; break;
        case 'register':
          register(data, socket); break;
        case 'disconnect':
          disconnect(socket); break;
        case 'offer':
        case 'decline':
        case 'answer':
        case 'candidate':
          sendTo(socket, data); break;
      }
    })
  })
}


// TODO: create a connect funciton that connects N clients togheter (with their rtc offers)
function sendTo (socket, data) {
  console.log(data.type)
  for (let client of wss.clients) {
    console.log(client.id === data.to, client.id, data.to)
    if (client.id === data.to) // finds the client we want to connect to
      return client.send(JSON.stringify(data)) // sends the data
  }

  // well we did not find it
  send(socket, {type: 'error', message: 'Not found'})
}

function register (data, socket) {
  if (typeof data.name === 'string' && /[^\w\s]/.test(data.name))
    return send(socket, { type: 'error', message: 'invalid name' })

  socket.name = data.name
  console.log('register', socket.id, socket.name)
  let others = []
  for (let client of wss.clients) {
    if (client.name) {
      let info = { name: socket.name, id: socket.id }
      if (client.id === socket.id)
        continue
      others.push({ name: client.name, id: client.id })
      send(client, { type: 'connect', info })
    }
  }

  send(socket, { type: 'ack', ack: 'register', others })
}

// TODO: this needs to be tested (if others gets the disconnect)
function disconnect (socket) {
  const data = JSON.stringify({ type: 'disconnect', id: socket.id })
  wss.connections--
  console.log('disconnected', socket.id, socket.name)
  console.log('current connections', wss.connections)

  if (socket.name)
    for (let client of wss.clients)
      client.send(data) // dont stringify every time
}
function setPulse () {
  for (let client of wss.clients) { // if its brand new its going to be undefined
    if (client.ping_status !== undefined && !client.ping_status) {
      console.log('unreachable', client.id, client.name)
      client.terminate()
      continue
    }

    client.ping_status = false
    send(client, { type: 'ping' })
  }
}

function send (socket, data) {
  socket.send(JSON.stringify(data))
}
