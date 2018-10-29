class Bullet {
  constructor (x, y, angle) {
    this.ox = x
    this.oy = y
    this.x = x
    this.y = y
    this.oldx = x
    this.oldy = y
    this.speed = 65
    this.angle = angle
    this.dead = false
    this.played = false
  }

  get travel () {
    let dx = this.x - this.ox
    let dy = this.y - this.oy
    return Math.min(Math.sqrt(dx*dx + dy*dy), 400)
  }
  render () {
    this.oldx = this.x
    this.oldy = this.y
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed
    let l = this.travel
    strokeWeight(2)
    stroke('orange')
    circle(this.x, this.y, 1.3)
    stroke(0, 0, 0, 70)
    line(this.x, this.y, this.x - Math.cos(this.angle) * l, this.y - Math.sin(this.angle) * l)
  }
}

let BULLETS = [], BULLET_ANGLE = 0
class BulletManager {
  static Shoot (cowboy) {
    let x = cowboyA.body.RarmIK.bones[1].endx
    let y = cowboyA.body.RarmIK.bones[1].endy
    let a = cowboyA.body.RarmIK.bones[1].angle - HALF_PI / 8

    x = x + Math.cos(a) * cowboyA.body.dir * 15
    y = y + Math.sin(a) * cowboyA.body.dir * 15
    BulletManager.addBullet(x, y, 1)
  }

  static calcAngle () {
    let w = width - 190 * 2 // 170 + 10 (cowboy pos + pistol_dist)
    let h = 65 // roughly

    BULLET_ANGLE = -Math.atan2(h, w)
  }

  static addBullet (x, y, direction) {
    let a = BULLET_ANGLE
    if (direction === -1) a = PI - BULLET_ANGLE
    BULLETS.push(new Bullet(x, y, a))
  }

  static Render () {
    for (let i=0; i<BULLETS.length; i++) {
      let b = BULLETS[i]
      const bline = { a: {x: b.x, y: b.y}, b: { x: b.oldx, y: b.oldy} }
      if (abs(b.x - width/2) < 100 && !b.played) {
        b.played = true
        SOUND_LIBRARY.fly.play()
      }
      if (lineIntersect(bline, cowboyB.HB)) {
        cowboyB.ragMode(bline)
        b.dead = true
      } else if (lineIntersect(bline, cowboyA.HB)) {
        cowboyA.ragMode(bline)
        b.dead = true
      }

      if (b.x > width - 100 || b.x < 100)
        b.dead = true

      if (b.dead) {
        SOUND_LIBRARY.hit.play()
        BULLETS.splice(i, 1)
      }

      b.render()
    }
  }
}
