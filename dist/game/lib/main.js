const GRAVITY = .2, BOUNCE = .9, FRICTION = .99
let OUTFIT_DATA, SOUND_LIBRARY, PROPS
let outfits = ['simple'], color = 'cornflowerblue', dustController
let backgroundIMG
let cowboyA, cowboyB, GAMEOVER = false

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
  createCanvas(window.innerWidth, window.innerHeight)
  Events(document.querySelector('canvas'))

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
      // autoplay: true,
      loop: true,
      volume: 0.1,
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
  cowboyA = new CowBoy(170, height - 25, outfits.simple)
  cowboyB = new CowBoy(width - 170, height - 25, outfits.simple, -1)
  BulletManager.calcAngle()
}

function draw () {
  if (!GAMEOVER) update()
  else {
    cowboyA.down()
    cowboyB.down()
  }
  background('white')
  //image(backgroundIMG, 0, 0, width, height)


  BulletManager.Render()
  cowboyA.render()
  cowboyB.renderFrom(B.updownratio, B.shootratio)
  image(PROPS.house, -10, height - PROPS.house.height - 5)

  push()
    translate(width, 0)// - PROPS.house.width + 10, 0)
    scale(-1, 1)
    image(PROPS.house, 0, height - PROPS.house.height - 5)
  pop()

  push()
    translate(290, height - 22 - PROPS.barrel.height*.4)
    scale(.4)
    image(PROPS.barrel, 0, 0)
  pop()
  push()
    translate(width - 300 - PROPS.barrel.width*.4, height - 22 - PROPS.barrel.height*.4)
    scale(.4)
    image(PROPS.barrel, 0, 0)
  pop()

  image(PROPS.kaktus.img, PROPS.kaktus.pos, height - 9 - PROPS.kaktus.img.height)
  dustController.render(PROPS.dust)

  // ground
  fill('Coral')
  noStroke()
  rect(0, height - 10, width, 10)
}


// ######################################
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
