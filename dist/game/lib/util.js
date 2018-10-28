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
// CREDIT: Dan Fox (stack:9043805)
// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
  }
}
function lineIntersect (a, b) {
  return intersects(a.a.x, a.a.y, a.b.x, a.b.y, b.a.x, b.a.y, b.b.x, b.b.y)
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
