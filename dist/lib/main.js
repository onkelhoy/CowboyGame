const GRAVITY = .2, BOUNCE = .9, FRICTION = .99
let OUTFIT_DATA, SOUND_LIBRARY, PROPS
let outfits = ['simple'], color = 'cornflowerblue', dustController
let backgroundIMG
let cowboyA, cowboyB
let GAMEOVER = false, STARTED = false, countdown = 3,  SCALE = 1, GROUND_LEVEL = 100// countdown

let B = { updownratio: 0, shootratio: 0 }

// ######################################
// ######################################


function preload () {
  OUTFIT_DATA = [
    "upper arm", "upper leg", "lower leg", "lower arm",
    "pistol arm", "elbow", "knee", "torso", "head", "foot"
  ]
  outfits = loadImages(outfits, OUTFIT_DATA)
}
function setup () {
  INITCONNECT()
  width = window.innerWidth
  height = window.innerHeight
  createCanvas(max(width, height), min(width, height))
  Events(document.querySelector('canvas'))
  SCALE = map(width, 300, 1500, 0.35, 1)

  PROPS = {
    house: loadImage('/content/images/props/house.svg'),
    kaktus: {
      img: loadImage('/content/images/props/kaktus.svg'),
      pos: Math.random()*width/2 + width/4
    },
    barrel: loadImage('/content/images/props/barrel.svg'),
    dust: loadImage('/content/images/props/dust.svg')
  }
  backgroundIMG = loadImage('/content/images/background1.jpg')
  SOUND_LIBRARY = {
    background: new Howl({
      src: '/content/audio/ZitronSound - Wild West.mp3',
      //autoplay: true,
      loop: true,
      volume: 0.1,
    }),
    menu: new Howl({
      src: '/content/audio/ZitronSound - Lonely Cowboy.mp3',
      //autoplay: true,
      loop: true,
      volume: 0.4,
    }),
    gun: {
      play: () => {
        let index = Math.round(Math.random() * (SOUND_LIBRARY.gun.sounds.length-1))
        SOUND_LIBRARY.gun.sounds[index].play()
      },
      sounds: [
        new Howl({ src: '/content/audio/shot1.mp3' }),
        new Howl({ src: '/content/audio/shot2.mp3' })
      ]
    },
    hit: new Howl({ src: '/content/audio/hit.mp3'}),
    fly: {
      play: () => {
        let index = Math.round(Math.random() * (SOUND_LIBRARY.fly.sounds.length-1))
        SOUND_LIBRARY.fly.sounds[index].play()
      },
      sounds: [
        new Howl({ src: '/content/audio/Fly1.mp3', volume: .35 }),
        new Howl({ src: '/content/audio/Fly2.mp3', volume: .35 }),
        new Howl({ src: '/content/audio/Fly3.mp3', volume: .35 }),
        new Howl({ src: '/content/audio/Fly4.mp3', volume: .35 }),
        new Howl({ src: '/content/audio/Fly5.mp3', volume: .35 })
      ]
    },
    out: new Howl({ src: '/content/audio/out.mp3' }),
    reload: new Howl({ src: '/content/audio/reload.mp3', volume: .2 })
  }

  dustController = new Dust()
  cowboyA = new CowBoy(170*SCALE, height - 25*SCALE, outfits.simple)
  cowboyB = new CowBoy(width - 170*SCALE, height - 25*SCALE, outfits.simple, -1)
  BulletManager.calcAngle()

}
function draw () { // locally can start... but hey
  if (!GAMEOVER && STARTED) update()
  else {
    cowboyA.down()
    cowboyB.down()
  }
  background('white')
  //image(backgroundIMG, 0, 0, width, height)


  BulletManager.Render()
  cowboyA.render()
  cowboyB.renderFrom(B.updownratio, B.shootratio)
  rimage(PROPS.house, -10*SCALE, height - PROPS.house.height*SCALE - 5)

  push()
    translate(width, 0)// - PROPS.house.width + 10, 0)
    scale(-1, 1)
    rimage(PROPS.house, 0, height - PROPS.house.height*SCALE - 5)
  pop()

  push()
    translate(290*SCALE, height - 22*SCALE - PROPS.barrel.height*SCALE*.4)
    scale(.4)
    rimage(PROPS.barrel, 0, 0)
  pop()
  push()
    translate(width - 300*SCALE - PROPS.barrel.width*SCALE*.4, height - 22*SCALE - PROPS.barrel.height*SCALE*.4)
    scale(.4)
    rimage(PROPS.barrel, 0, 0)
  pop()

  rimage(PROPS.kaktus.img, PROPS.kaktus.pos, height - 9*SCALE - PROPS.kaktus.img.height*SCALE)
  dustController.render(PROPS.dust)

  // ground
  fill('Coral')
  noStroke()
  rect(0, height - 10, width, 10)
}


// ######################################
function COUNTDOWN (time) {
  if (countdown === 0) {
    document.querySelector('section.A').classList.remove('show')
    document.querySelector('section.B').classList.remove('show')
    STARTED = true
    return
  }
  // update Countdown DOM
  countdown--
  setInterval(() => COUNTDOWN(2000), time)
}
// ######################################

// UDATE FUNCTION
function update () {
  if (keys.space) {
    cowboyA.up()
    //cowboyB.up()
    color = 'cornflowerblue'
    //cowboyA.body.ragMode()
  }
  else {
    cowboyA.down()
    //cowboyB.down()
    color = 'tomato'
  }
}
