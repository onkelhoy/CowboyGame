// function rect (x, y, w, h) {
//   beginShape()
//   GAME.context.rect(x, y, w, h)
// }
// function fill (color) {
//   GAME.context.fillStyle = color
//   GAME.context.fill()
// }
// function line (x, y, x2, y2) {
//   GAME.context.moveTo(x, y)
//   GAME.context.lineTo(x2, y2)
// }
// function stroke (color, width = 1) {
//   GAME.context.strokeStyle = color
//   GAME.context.lineWidth = width
//   GAME.context.stroke()
// }
// function beginShape () {
//   GAME.context.beginPath()
// }
// function endShape () {
//   GAME.context.closePath()
// }
// function circle (x, y, r) {
//   beginShape()
//   GAME.context.arc(x, y, r, 0, Math.PI * 2)
// }
function circle (x, y, r) {
  ellipse(x, y, r*2, r*2)
}
function loadImages (outfits, parts) {
  let bigset = {}
  for (let outfit of outfits) {
    let set = {}
    for (let part of parts) {
      let url = `/content/images/outfits/${outfit}/${part}.svg`
      set[part.replace(' ', '_')] = loadImage(url)
    }

    bigset[outfit] = set
  }

  return bigset
}
