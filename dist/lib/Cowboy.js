class CowBoy {
  constructor (x, y, outfit, dir = 1) {
    this.hasShot = false
    this.max = 10 // max updownratio
    this.reloadMax = 40 // max reload wait
    this.updownratio = this.max
    this.reloadWait = this.reloadMax
    this.out = false // out of bullets (same as hasShot)

    this.body = null
    this.revolver = new Revolver(width / 2, height / 4)
    this.shootratio = 0
    this.body = new Body(x, y, dir, outfit)

    this.HB = {
      a: {x: 0, y: 0},
      b: {x: 0, y: 0}
    }
  }
  set x (v) {
    this.body.xpos = v
  }

  // when cowboy should duck (decreases updownratio)
  down () {
    // reload
    if (this.updownratio > 0)
      this.updownratio -= .5

    if (!GAMEOVER) {
      this.release()
      if (this.updownratio === 0) {
        this.reload()
      }
    }

    if (this.shootratio > 0)
      this.shootratio -= .08
  }
  // and when he should go up (increases updownratio)
  up () {
    this.updownratio = Math.floor(this.updownratio)
    if (this.updownratio < this.max)
      this.updownratio++
    // stand up & shoot
    if (this.shootratio > 0) this.shootratio -= .05

    if (this.updownratio === this.max)
      this.shoot()
  }

  // when cowboy is down and reload timer is zero
  reload () {
    if (this.reloadWait > 0)
      this.reloadWait--
    else if (this.revolver.ammo < 6){
      //if ()
      SOUND_LIBRARY.reload.play()
      this.revolver.ammo++
      this.reloadWait = this.reloadMax
      this.revolver.angle -= Math.PI / 3
    }
  }
  // when cowboy is up and shoot timer is zero
  shoot () {
    if (this.hasShot) return
    if (this.revolver.ammo > 0) {
      this.shootratio = 1
      this.hasShot = true
      this.revolver.ammo--
      this.revolver.angle += Math.PI/6

      SOUND_LIBRARY.gun.play()
      BulletManager.Shoot()
    }
    else if (!this.out) {
      this.out = true
      SOUND_LIBRARY.out.play()
    }
  }
  // when cowboy starts going down
  release () {
    this.out = false
    if (!this.hasShot) return
    this.hasShot = false
    this.revolver.angle += Math.PI/6
  }

  render () {
    //console.log(this.shootratio)
    this.revolver.render()
    this.renderFrom(this.updownratio / this.max, this.shootratio)
  }
  ragMode (bullet_line) {
    //GAMEOVER = true
    let dx = bullet_line.b.x - bullet_line.a.x,
        dy = bullet_line.b.y - bullet_line.a.y
    dx *= 0.5
    dy *= 0.5
    this.body.ragMode(dx, dy)
  }
  renderFrom (u, s) {
    this.body.render(u, s)


    this.HB.a.x = this.body.head.x + 10 * this.body.dir
    this.HB.a.y = this.body.head.y - 10
    this.HB.b.x = this.body.head.endx + 10 * this.body.dir
    this.HB.b.y = this.body.head.endy + 10


        // stroke('tomato')
        // strokeWeight(3)
        // line(this.HB.a.x, this.HB.a.y, this.HB.b.x, this.HB.b.y)
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
