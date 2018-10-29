let PLAYERS = 0
let peer
function INITCONNECT () {
  console.log(ID)
  let siteUrl = window.location.href
  siteUrl = 'ws://'+siteUrl.split('://')[1]
  peer = new Peer(siteUrl, {
    append: appendPlayer,
    decline: (d) => console.log(d, 'decline'),
    remove: (d) => console.log(d, 'remove'),
    error: (d) => console.log(d, 'error'),
    addOthers,
    others: null
  })

  peer.onopen = () => {
    if (peer.host) {
      peer.started = new Date().getTime()
      peer.send({ type: 'handshake', timestamp: peer.started })
      COUNTDOWN (2000)
    }
    peer.on('message', receiveData)
  }
}

function receiveData (message) {
  let data = JSON.parse(message.data)
  console.log(data)
  if (data.type === 'handshake') {
    let ts = new Date().getTime()
    let diff = ts - data.timestamp
    console.log(diff)

    COUNTDOWN (2000 - diff)
  }
  else {
    // data = { shoot: false, updownratio, shootratio }
  }

  console.log(data)
}
function send (data) {
  peer.send(JSON.stringify({ id: peer.info.id, data }))
}

function appendPlayer (data) {
  peer.host = true
  peer.makeOfferTo(data.id)
  addPlayer(data)
}
function addOthers (others) {
  if (!others) return
  for (let other of others)
    addPlayer(other)
}
function addPlayer (data) {
  let name = data.name
  let elm
  if (PLAYERS === 0)
    elm = document.querySelector('section.A')
  else {
    if (data.id === peer.info.id) {
      cowboyA.x = width - 170
      cowboyB.x = 170
      cowboyB.body.dir = 1
      cowboyA.body.dir = -1
    }
    elm = document.querySelector('section.B')
  }

  elm.querySelector('p').innerText = name
  elm.classList.add('show')

  PLAYERS++
  if (PLAYERS === 2) {

  }
}

function NameClick () {
  let name = document.querySelector("div.namePopup > div > input").value
  if (name !== '') {
    let t = document.querySelector('div.namePopup')
    t.parentNode.removeChild(t)
    peer.name = name
  }
}
