class Ragdoll {
  constructor (body) {
    this.points = []
    this.sticks = {}

    // maps all (necessary) body parts to sticks
    this.points.push(new RPoint(body.head.endx, body.head.endy))
    this.points.push(new RPoint(body.torso.endx, body.torso.endy))
    this.points.push(new RPoint(body.torso.x, body.torso.y))


    // wrapping torso (4 points)
    let a = body.torso.angle - HALF_PI
    let l = body.parts.torso.width * body.imageratio / 2
    this.points.push(new RPoint(body.torso.endx - cos(a) * l, body.torso.endy - sin(a) * l))
    this.points.push(new RPoint(body.torso.endx + cos(a) * l, body.torso.endy + sin(a) * l))
    this.points.push(new RPoint(body.torso.x + cos(a) * l, body.torso.y + sin(a) * l))
    this.points.push(new RPoint(body.torso.x - cos(a) * l, body.torso.y - sin(a) * l))

    // index 3-4 [L ARM]
    this.points.push(new RPoint(body.LarmIK.bones[1].x, body.LarmIK.bones[1].y))
    this.points.push(new RPoint(body.LarmIK.bones[1].endx, body.LarmIK.bones[1].endy))
    // index 5-6 [R ARM]
    this.points.push(new RPoint(body.RarmIK.bones[1].x, body.RarmIK.bones[1].y))
    this.points.push(new RPoint(body.RarmIK.bones[1].endx, body.RarmIK.bones[1].endy))
    // index 7-8 [L LEG]
    this.points.push(new RPoint(body.LlegIK.bones[1].x, body.LlegIK.bones[1].y))
    this.points.push(new RPoint(body.LlegIK.bones[0].x, body.LlegIK.bones[0].y))
    // index 9-10 [R LEG]
    this.points.push(new RPoint(body.RlegIK.bones[1].x, body.RlegIK.bones[1].y))
    this.points.push(new RPoint(body.RlegIK.bones[0].x, body.RlegIK.bones[0].y))



    // head and torso
    this.sticks.head = {
      stick: [new Stick(this.points[0], this.points[1])],
      parent: 'torso'
    }
    this.sticks.torso = {
      stick: [new Stick(this.points[1], this.points[2])],
      parent: null
    }
    this.sticks.torsoCollection = {
      stick: [
        new Stick(this.points[3], this.points[1]),
        new Stick(this.points[1], this.points[4]),
        new Stick(this.points[3], this.points[4]),
        new Stick(this.points[4], this.points[5]),
        new Stick(this.points[5], this.points[6]),
        new Stick(this.points[6], this.points[3]),
        new Stick(this.points[6], this.points[2]),
        new Stick(this.points[2], this.points[5]),
        new Stick(this.points[6], this.points[4])
      ],
      parent: null
    }

    // left arm
    this.sticks.Larm = {
      stick: [new Stick(this.points[1], this.points[7]), new Stick(this.points[7], this.points[8])],
      parent: 'torso'
    }
    // right arm
    this.sticks.Rarm = {
      stick: [new Stick(this.points[1], this.points[9]), new Stick(this.points[9], this.points[10])],
      parent: 'torso'
    }

    // left leg
    this.sticks.Lleg = {
      stick: [new Stick(this.points[2], this.points[11]), new Stick(this.points[11], this.points[12])],
      parent: 'torso'
    }
    // right leg
    this.sticks.Rleg = {
      stick: [new Stick(this.points[2], this.points[13]), new Stick(this.points[13], this.points[14])],
      parent: 'torso'
    }
    // this.sticks.push(new Stick(this.points[1], this.points[2]))
  }


  update () {

    for (let point of this.points)
      point.update()
    for (let partname in this.sticks) {
      let part = this.sticks[partname],
          parent = null
      if (part.parent)
        parent = this.sticks[part.parent].stick[0]
      for (let i=0; i<part.stick.length; i++) {
        let stick = part.stick[i]
        stick.update()
      }
    }
  }
}
// stick A and B share common point (stickA.b = stickB.a)
function angleBetween (stickA, stickB) {
  return Math.abs(-stickA.angle + stickB.angle)
}

class Stick {
  constructor (a, b) {
    let dx = a.x - b.x,
        dy = a.y - b.y
    this.a = a
    this.b = b
    this.length = Math.sqrt(dx*dx + dy*dy)
  }

  get dx () { return this.b.x - this.a.x }
  get dy () { return this.b.y - this.a.y }
  get angle () { return Math.atan2(this.dy, this.dx) }

  // connects the two points by their length constructor
  update () {
    let dx = this.dx,
        dy = this.dy

    let distance = Math.sqrt(dx*dx + dy*dy)
    let difference = this.length - distance
    let percent = difference / distance / 2 // each point needs to move

    let ox = dx * percent, oy = dy * percent
    this.a.x -= ox
    this.a.y -= oy

    this.b.x += ox
    this.b.y += oy
  }

  renderIMG (img, r) {
    if (r === undefined)
      r = this.length / img.height
    let a = this.angle-HALF_PI
    let l = img.width*r/2
    push()
      translate(this.a.x - Math.cos(a)*l, this.a.y - Math.sin(a)*l)
      rotate(a)
      scale(r)
      image(img, 0, 0)
    pop()
  }
  render () {
    this.update()
    stroke(0)
    line(this.a.x, this.a.y, this.b.x, this.b.y)
  }
}
class RPoint {
  constructor (x, y) {
    this.x = x
    this.y = y

    this.oldx = x
    this.oldy = y
  }

  // velocity is based on previus position
  update () {
    let vx = (this.x - this.oldx) * FRICTION
    let vy = (this.y - this.oldy) * FRICTION

    this.oldx = this.x
    this.oldy = this.y
    this.x += vx
    this.y += vy
    this.y += GRAVITY

    if (this.x > width - 100) {
      this.x = width - 100
      this.oldx = this.x + vx * BOUNCE
    }
    if (this.x < 100) {
      this.x = 100
      this.oldx = this.x + vx * BOUNCE
    }

    if (this.y > height - 25) {
      this.y = height - 25
      this.oldy = this.y + vy * BOUNCE
    }
    if (this.y < 0) {
      this.y = 0
      this.oldy = this.y + vy * BOUNCE
    }
  }
  render () {
    this.update()
    stroke(0)
    point(this.x, this.y)
  }
}
