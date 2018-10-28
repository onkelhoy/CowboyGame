class Bone {
  constructor (angle, length, parent, x, y) {
    this.x = x || parent.endx
    this.y = y || parent.endy

    this.angle = angle
    this.length = length
    this.parent = parent
  }

  get endx () { return this.x + Math.cos(this.angle) * this.length }
  get endy () { return this.y + Math.sin(this.angle) * this.length }

  end (scale) {
    let temp = this.length
    this.length *= scale

    let e = {x:this.endx, y:this.endy}
    this.length = temp
    return e
  }

  pointAt(x, y) {
    let dx = x - this.x,
        dy = y - this.y

    this.angle = Math.atan2(dy, dx)
  }

  drag (x, y) {
    this.pointAt(x, y)
    this.x = x - Math.cos(this.angle) * this.length
    this.y = y - Math.sin(this.angle) * this.length

    if (this.parent)
      this.parent.drag(this.x, this.y)
  }

  render (img, scale_val, dir, inverse = false) {
    if (img) {
      let x, y, a
      let d = img.width / 2 * scale_val

      if (inverse)
      {
        x = this.endx, y = this.endy
        a = Math.atan2(y - this.y, x - this.x) + Math.PI/2
      }
      else
      {
        x = this.x, y = this.y
        a = Math.atan2(this.endy - y, this.endx - x) - Math.PI/2
      }

      x -= Math.cos(a) * d * dir
      y -= Math.sin(a) * d * dir


      push()
        translate(x, y)
        scale(dir, 1)
        scale(scale_val)
        rotate(a*dir)
        image(img, 0, 0)
      pop()
    } else {
      stroke('black')
      noFill()
      ellipse(this.x, this.y, 4, 4)
      line(this.x, this.y, this.endx, this.endy)
    }
  }
}

class IKRig {
  constructor (x, y, bones, length) {
    this.bones = []
    this.x = x
    this.y = y

    for (let i=0; i<bones; i++)
      if (i === 0)
        this.bones.push(new Bone(-Math.PI/2, length, null, x, y))
      else
        this.bones.push(new Bone(-Math.PI/2, length, this.bones[i-1]))
  }

  drag (x, y) {
    this.bones[this.bones.length-1].drag(x, y)
  }
  reach (x, y) {
    this.drag(x, y)
    this.update()
  }
  boneReach (index, x, y) {
    if (this.bones.length > index && index > -1) {
      this.bones[index].drag(x, y)
      this.update()
    }
  }
  update () {
    for (let bone of this.bones) {
      if (bone.parent) {
        bone.x = bone.parent.endx
        bone.y = bone.parent.endy
      }
      else {
        bone.x = this.x
        bone.y = this.y
      }
    }
  }

  render (ratio, dir, reverse, joint, ...images) {
    for (let i=0; i<this.bones.length; i++) {
      this.bones[i].render(images[i], ratio, dir, reverse)
      if (i !== 0) {
        push()
          translate(this.bones[i].x, this.bones[i].y)
          scale(ratio)
          imageMode(CENTER)
          image(joint, 0, 0)
        pop()
      }
    }
  }
}
