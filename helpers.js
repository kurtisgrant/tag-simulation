function weigh(v1, v2, f1, f2) {
  const total = f1 + f2
  return +((v1 * f1 + v2 * f2) / total).toFixed(1)
}

function alias(bd) {
  return {
    id: bd.id,
    name: bd.name,
    pos: createVector(bd.pos.x, bd.pos.y),
    vel: createVector(bd.vel.x, bd.vel.y),
    acc: createVector(bd.acc.x, bd.acc.y),
    color: bd.color,
    it: bd.it,
    tagged: bd.tagged,
    itCooldown: bd.itCooldown,
    setIt: function (val) {
      bd.setIt(val)
    }
  }
}