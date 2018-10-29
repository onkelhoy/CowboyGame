class DustBall {
  constructor (direction) {
    // console.log(direction)
    this.x = -100 * direction + (1 - (direction+1)/2) * width
    this.speed = (Math.random() * 2.5 + 2) * direction
    this.size = Math.random() * .4 + .6
  }

  render (dustIMG) {
    this.x += this.speed
    push()
      translate(
        this.x,
        -Math.abs(Math.sin(this.x * 0.01)) * 50 + height - this.size*dustIMG.height/2,
      )
      scale(this.size)
      rotate(this.x * 0.01)
      imageMode(CENTER)
      image(dustIMG, 0, 0)
    pop()
  }
}

class Dust {
  constructor () {
    this.dusts = []
    this.until = 0

    this.next()
  }

  next () {
    this.until = Math.random() * 1000 + 500
  }

  render (dustIMG) {
    this.until--
    if (this.until < 0) {
      this.next()
      this.dusts.push(new DustBall(Math.round(Math.random()) * 2 - 1))
    }

    for (let i=0; i<this.dusts.length; i++) {
      let dust = this.dusts[i]
      dust.render(dustIMG)

      // if (dust.speed > 0 && dust.x > width + 100 || dust.dir < 0 && dust.x < -100)
      //   this.dusts.splice(i, 1)
    }

  }
}
