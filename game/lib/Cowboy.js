class CowBoy {
  constructor (x, y, outfit, dir = 1) {
    this.hasShot = false
    this.max = 10
    this.reloadMax = 40
    this.updownratio = this.max
    this.reloadWait = this.reloadMax
    this.out = false

    this.body = null
    this.revolver = new Revolver(width / 2, height / 4)
    this.shootratio = 0
    this.body = new Body(x, y, dir, outfit)
  }

  down () {
    // reload
    if (this.updownratio > 0)
      this.updownratio -= .5
    this.release()

    if (this.shootratio > 0)
      this.shootratio -= .08

    if (this.updownratio === 0) {
      this.reload()
    }
  }
  up () {
    this.updownratio = Math.floor(this.updownratio)
    if (this.updownratio < this.max)
      this.updownratio++
    // stand up & shoot
    if (this.shootratio > 0) this.shootratio -= .05

    if (this.updownratio === this.max)
      this.shoot()
  }

  reload () {
    if (this.reloadWait > 0)
      this.reloadWait--
    else if (this.revolver.ammo < 6){
      //if ()
      this.revolver.ammo++
      this.reloadWait = this.reloadMax
      this.revolver.angle -= Math.PI / 3
    }
  }
  shoot () {
    if (this.hasShot) return
    if (this.revolver.ammo > 0) {
      this.shootratio = 1
      this.hasShot = true
      this.revolver.ammo--
      this.revolver.angle += Math.PI/6

      SOUND_LIBRARY.gun.play()
    }
    else if (!this.out) {
      this.out = true
      SOUND_LIBRARY.out.play()
    }
  }
  release () {
    this.out = false
    if (!this.hasShot) return
    this.hasShot = false
    this.revolver.angle += Math.PI/6
  }

  render () {
    //console.log(this.shootratio)
    this.body.render(this.updownratio / this.max, this.shootratio)
    this.revolver.render()
  }
}

class Revolver {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.ammo = 6
    this.start = -Math.PI/6
    this.angle = 0
    this.tick = 0
  }

  render () {
    let x = this.x
    let y = this.y

    let a = this.angle + this.start

    noStroke()

    fill('#999')
    circle(x, y, 50)
    for (let i=0; i<6; i++) {
      let p = Math.PI * 2 * i / 6 + a
      circle(x + 32 * Math.cos(p), y + 32 * Math.sin(p), 25)
    }
    for (let i=0; i<6; i++) {
      let p = Math.PI * 2 * i / 6 + a
      fill('#444')
      circle(x + 35 * Math.cos(p), y + 35 * Math.sin(p), 15)

      if (i < this.ammo) {
        fill('#FFD700')
        circle(x + 35 * Math.cos(p), y + 35 * Math.sin(p), 14)
        fill('#DAA520')
        circle(x + 35 * Math.cos(p), y + 35 * Math.sin(p), 6)
        //stroke('#777', 0.5)
      }
    }

    fill('#666')
    circle(x, y, 13)
    fill('#ddd')
    circle(x, y, 7)
  }
}
