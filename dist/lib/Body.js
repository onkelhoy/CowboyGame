// THIS WHOLE CLASS IS SOOOO UGLYY!!!!!
// THE CODE IS THE WORST!!!!

class Body {
  constructor (x, y, dir = 1, parts) {
    this.x = x
    this.y = y

    this.parts = parts

    this.imageratio =  60 / parts.torso.height

    this.legsMain = new Bone(-Math.PI/2 - 0.005, 80, null, x, y)
    this.bodyMain = new Bone(-Math.PI/2 + 0.1, 100, null, x, y)
    this.armMain = new Bone(Math.PI/5, 50, null, x, y)
    this.elbow = new Bone(0, 30, this.armMain)
    this.elbow.sangle = 2*Math.PI/3

    this.torso = new Bone(-Math.PI/2, 60, null, x, y)
    this.RarmIK = new IKRig(x, y, 2, 38)
    this.LarmIK = new IKRig(x, y, 2, 34)
    this.RlegIK = new IKRig(x, y, 2, 40)
    this.LlegIK = new IKRig(x + 10, y, 2, 40)
    this.head = new Bone(-Math.PI/2, 75, this.torso)
    this.Lfoot = new Bone(0, 10, null, x, y)
    this.Rfoot = new Bone(0, 10, null, x, y)

    this.dir = dir

    this.MODE = 'normal'
  }
  set xpos (v) {
    this.x = v
    this.legsMain = new Bone(-Math.PI/2 - 0.005, 80, null, v, this.y)
    this.bodyMain = new Bone(-Math.PI/2 + 0.1, 100, null, v, this.y)
    this.armMain = new Bone(Math.PI/5, 50, null, v, this.y)
    this.elbow = new Bone(0, 30, this.armMain)
    this.elbow.sangle = 2*Math.PI/3

    this.torso = new Bone(-Math.PI/2, 60, null, v, this.y)
    this.RarmIK = new IKRig(v, this.y, 2, 38)
    this.LarmIK = new IKRig(v, this.y, 2, 34)
    this.RlegIK = new IKRig(v, this.y, 2, 40)
    this.LlegIK = new IKRig(v + 10, this.y, 2, 40)
    this.head = new Bone(-Math.PI/2, 75, this.torso)
    this.Lfoot = new Bone(0, 10, null, v, this.y)
    this.Rfoot = new Bone(0, 10, null, v, this.y)
  }

  update () {
    let x = this.legsMain.endx,
        y = this.legsMain.endy

    this.LlegIK.boneReach(0, this.LarmIK.bones[0].endx, this.LarmIK.bones[0].endy)
    this.RlegIK.boneReach(0, this.LarmIK.bones[0].endx, this.LarmIK.bones[0].endy)
    this.LlegIK.reach(x + 6*this.dir, y)
    this.RlegIK.reach(x, y)

    this.torso.drag(this.bodyMain.endx, this.bodyMain.endy)
    this.torso.x = x
    this.torso.y = y

    this.head.x = this.torso.endx
    this.head.y = this.torso.endy

    let e = this.torso.end(.8)

    this.armMain.x = e.x
    this.armMain.y = e.y

    this.elbow.x = x = this.armMain.endx
    this.elbow.y = y = this.armMain.endy
    this.elbow.pointAt(
      x + Math.cos(this.armMain.angle + this.elbow.sangle*this.dir) * this.elbow.length,
      y + Math.sin(this.armMain.angle + this.elbow.sangle*this.dir) * this.elbow.length
    )


    this.RarmIK.x = this.armMain.x
    this.RarmIK.y = this.armMain.y
    this.LarmIK.x = this.armMain.x - Math.cos(this.armMain.angle + Math.PI/2) * 4 * this.dir
    this.LarmIK.y = this.armMain.y - Math.sin(this.armMain.angle + Math.PI/2) * 4 * this.dir

    this.LarmIK.boneReach(0, this.elbow.endx, this.elbow.endy)
    this.RarmIK.boneReach(0, this.elbow.endx, this.elbow.endy)
    this.RarmIK.reach(x, y)
    this.RarmIK.reach(x, y)
    this.LarmIK.reach(x, y)
    this.LarmIK.reach(x, y)
  }

  render (updownratio, shootratio) {
    let r = this.imageratio, d = this.dir

    if (this.MODE === 'normal') {
      this.update()
      this.legsMain.length = 20 + 60 * updownratio
      this.bodyMain.length = 100 + 60 * updownratio

      this.bodyMain.angle = -Math.PI/2 + (0.3 - 0.25*updownratio - shootratio*.12)*this.dir

      this.LlegIK.x = this.x + (10 + (1 - updownratio)*20)*this.dir

      this.armMain.angle = (
        -Math.PI/5 + PI/3.5 *
        updownratio - PI / 3 * shootratio
      ) * this.dir + ( PI * (1-(this.dir+1)/2))

      this.armMain.length = 50 + 20 * updownratio - 25 * shootratio
      this.LlegIK.render(r, d, true, this.parts.knee, this.parts.lower_leg, this.parts.upper_leg)
      this.LarmIK.render(r, d, false, this.parts.elbow, this.parts.upper_arm, this.parts.lower_arm)
      this.torso.render(this.parts.torso, r+.03, d, true)
      this.RlegIK.render(r, d, true, this.parts.knee, this.parts.lower_leg, this.parts.upper_leg)
      this.RarmIK.render(r, d, false, this.parts.elbow, this.parts.upper_arm, this.parts.pistol_arm)
      this.head.render(this.parts.head, r, d, true)

      push()
        translate(this.RlegIK.x, this.RlegIK.y)
        scale(d, 1)
        scale(r)
        image(this.parts.foot, 0, 0)
      pop()
      push()
        translate(this.LlegIK.x, this.LlegIK.y)
        scale(d, 1)
        scale(r)
        image(this.parts.foot, 0, 0)
      pop()
    }
    else {
      this.ragdoll.update()

      // VERY UGLY CODE
      this.ragdoll.sticks.Lleg.stick[0].renderIMG(this.parts.upper_leg)
      this.ragdoll.sticks.Lleg.stick[1].renderIMG(this.parts.lower_leg)

      this.ragdoll.sticks.Larm.stick[0].renderIMG(this.parts.upper_arm)
      this.ragdoll.sticks.Larm.stick[1].renderIMG(this.parts.lower_arm)

      this.ragdoll.sticks.Rleg.stick[0].renderIMG(this.parts.upper_leg)
      this.ragdoll.sticks.Rleg.stick[1].renderIMG(this.parts.lower_leg)
      push()
        translate(this.ragdoll.sticks.Rleg.stick[1].b.x, this.ragdoll.sticks.Rleg.stick[1].b.y)
        scale(r)
        image(this.parts.foot, 0, 0)
      pop()
      push()
        translate(this.ragdoll.sticks.Lleg.stick[1].b.x, this.ragdoll.sticks.Lleg.stick[1].b.y)
        scale(r)
        image(this.parts.foot, 0, 0)
      pop()


      this.ragdoll.sticks.torso.stick[0].renderIMG(this.parts.torso, r)
      this.ragdoll.sticks.head.stick[0].renderIMG(this.parts.head, r)

      this.ragdoll.sticks.Rarm.stick[0].renderIMG(this.parts.upper_arm)
      this.ragdoll.sticks.Rarm.stick[1].renderIMG(this.parts.pistol_arm, r)
    }
  }

  ragMode (dx, dy) {
    this.MODE = 'ragdoll'
    this.ragdoll = new Ragdoll(this)
    this.ragdoll.sticks.head.stick[0].a.oldx += dx
    this.ragdoll.sticks.head.stick[0].a.oldy += dy
  }
}
