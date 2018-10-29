const server = require('../server.js')
const WebSocket = require('ws')

let wss, rooms = []
module.exports = {
  init: function () {
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
            register2(data, socket); break;
          case 'disconnect':
            disconnect(socket); break;
          case 'offer':
          case 'decline':
          case 'answer':
          case 'candidate':
            sendTo2(socket, data); break;
        }
      })
    })
  }
}

function createRoom (id, socket) {
  let room = {
    id,
    clients: [socket],
    init: true
  }

  rooms.push(room)
  return room.clients
}

function sendTo2 (socket, data) {
  let roomID = data.room
  let room = getRoom(roomID)
  if (room)
    for (let client of room.clients)
      if (client.id !== socket.id)
        return send(client, data)

  // well we did not find it
  send(socket, {type: 'error', message: 'Not found'})
}

function getRoom (id) {
  for (let room of rooms)
    if (room.id === id) return room
  return null
}
function register2 (data, socket) {
  if (typeof data.name === 'string' && /[^\w\s]/.test(data.name))
    return send(socket, { type: 'error', message: 'invalid name' })

  // console.log(data)
  socket.name = data.name
  console.log('register', data.room, socket.id, socket.name)
  let others = null
  let room = getRoom(data.room)
  if (room) {
    room.clients.push(socket)
    let info = { name: socket.name, id: socket.id }
    for (let client of room.clients)
      if (client.id !== socket.id) send(client, { type: 'connect', info })

    others = room.clients
  } else {
    others = createRoom(data.room, socket)
  }
  socket.room = data.room
  others = others.map(c => { return {name: c.name, id: c.id} })

  send(socket, { type: 'ack', ack: 'register', others })
}

// TODO: this needs to be tested (if others gets the disconnect)
function disconnect (socket) {
  const data = JSON.stringify({ type: 'disconnect', id: socket.id })
  wss.connections--
  console.log('disconnected', socket.id, socket.name)
  console.log('current connections', wss.connections)

  if (socket.name)
  {
    let room = getRoom(socket.room)
    if (room) {
      for (let i=0; i<room.clients.length; i++) {
        if (room.clients[i].id === socket.id)
          room.clients.splice(i, 1)
      }
      if (room.clients.length === 0)
        for (let i=0; i<rooms.length; i++)
          if (rooms[i].id === room.id) rooms.splice(i, 1)
    }
  }
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
  console.log('sending to', socket.name, data)
  socket.send(JSON.stringify(data))
}
