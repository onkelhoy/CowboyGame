let OUTFIT_DATA, SOUND_LIBRARY, PROPS
let outfits = ['simple'], color = 'cornflowerblue'
let backgroundIMG
let cowboyA

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
    }
  }
  backgroundIMG = loadImage('/content/images/background1.jpg')
  SOUND_LIBRARY = {
    background: new Howl({
      src: ['/content/audio/ZitronSound - Wild West.mp3'],
      //autoplay: true,
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
    out: new Howl({ src: '/content/audio/out.mp3' })
  }

  //await loadContent()
  cowboyA = new CowBoy(170, height - 25, outfits.simple)
}

function draw () {
  update()
  background('white')
  //image(backgroundIMG, 0, 0, width, height)


  cowboyA.render()
  image(PROPS.house, -10, height - PROPS.house.height - 5)

  push()
    translate(width, 0)// - PROPS.house.width + 10, 0)
    scale(-1, 1)
    image(PROPS.house, 0, height - PROPS.house.height - 5)
  pop()

  image(PROPS.kaktus.img, PROPS.kaktus.pos, height - 9 - PROPS.kaktus.img.height)

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
  }
  else {
    cowboyA.down()
    //cowboyB.down()
    color = 'tomato'
  }
}
