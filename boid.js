class Boid {
  constructor({
    id = random().toString().slice(2),
    name = random(Names.filter(n => n.length < 8)),
    color = "#7badf7",
    size = Size,

    pos = createVector(random(0, W), random(0, H)),
    vel = p5.Vector.random2D().setMag(random(...Ranges.speed)),

    it = false,
    tagged = false,
    itCooldown = 0,
    percepRad = random(...Ranges.percepRad),

    fitness = round(random(1, 10)),
    speed = round(random(1, 10)),
    agility = round(random(1, 10)),
    stamina = round(random(1, 10)),

    diags = {
      percepRad: false,
      cooldown: false,
      wander: false

    }
  }) {
    this.id = id
    this.name = name
    this.color = color
    this.size = size
    this.pos = pos
    this.vel = vel
    this.it = it
    this.itCooldown = itCooldown
    this.percepRad = percepRad
    this.tagged = tagged
    this.wandering = true
    this.wanderCooldown = 0

    this.acc = createVector(0, 0)
    this.sight = []
    this.wanderAngle = 0

    this.diags = {
      percepRad: diags.percepRad,
      cooldown: diags.cooldown,
      wander: diags.wander
    }

    this.r = {
      fitness: fitness,
      speed: speed,
      agility: agility,
      stamina: stamina
    }
    this.wr = {
      speed: weigh(this.r.speed, this.r.fitness, 2, 3),
      agility: weigh(this.r.agility, this.r.fitness, 2, 3),
      stamina: weigh(this.r.stamina, this.r.fitness, 2, 3)
    }
    this.maxSpeed = map(this.wr.speed, 1, 10, ...Ranges.speed)
    this.maxForce = map(this.wr.agility, 1, 10, ...Ranges.agility)
    this.wanderSpeed = this.maxSpeed * random(0.5, 0.8)
  }
  setIt(bool) {
    if (bool && this.itCooldown <= 0) {
      this.it = true
      this.tagged = true
      this.color = '#fa8072'
    } else if (!bool) {
      if (this.it) {
        this.itCooldown = Cooldown
      }
      this.it = false
      this.color = '#7badf7'
    }
  }
  wander() {
    this.wandering = true
    this.wanderCooldown = this.wanderCooldown - 1
    if (random() > 0.8) this.wanderAngle += random(...Ranges.wanderAngOffset)

    let wanderPoint = p5.Vector.add(this.pos, this.vel.copy().setMag(80))
    let wanderRadius = 20
    let theta = this.wanderAngle + this.vel.heading()
    let wanderTarget = wanderPoint.copy().add(p5.Vector.fromAngle(theta).setMag(wanderRadius))

    if (this.diags.wander) {
      fill('orange')
      circle(wanderPoint.x, wanderPoint.y, 8)
      noFill()
      stroke('orange')
      circle(wanderPoint.x, wanderPoint.y, wanderRadius * 2)
      noStroke()
      fill('red')
      circle(wanderTarget.x, wanderTarget.y, 12)
    }

    let force = wanderTarget.sub(this.pos)
    force.setMag(this.maxForce)
    this.applyForce(force)
    return force
  }
  pursue(bd) {
    this.wandering = false
    this.wanderCooldown = WanderCooldown
    let nxtPos = p5.Vector.add(this.pos, this.vel)
    let displacement = bd.pos.copy().sub(this.pos)
    let distance = displacement.mag()

    let root = 1.2
    let desiredSpeed = Math.pow(2 * this.maxForce * distance, 1 / root) + bd.vel.mag()
    if (distance < 2) {
      desiredSpeed = 0.1 * distance
    }

    let force = p5.Vector.sub(displacement.setMag(desiredSpeed), this.vel)
    force.limit(this.maxForce)
    this.applyForce(force)
    return force
  }
  seek(target) {
    this.wandering = false
    this.wanderCooldown = WanderCooldown
    let force = p5.Vector.sub(target, this.pos)
    force.setMag(this.maxSpeed)
    force.limit(this.maxForce)
    this.applyForce(force)
    return force
  }
  flee(target) {
    this.wandering = false
    this.wanderCooldown = WanderCooldown
    let force = p5.Vector.sub(this.pos, target)
    force.setMag(this.maxSpeed)
    force.limit(this.maxForce)
    this.applyForce(force)
    return force
  }
  react() {
    let rel = this.sight.filter(b =>
      b.id !== this.id &&
      b.it !== this.it &&
      b.tagged !== this.tagged &&
      b.itCooldown <= 0)
    if (rel.length === 0) return this.wander()
    if (this.it) {
      let closestBoid
      let closestDist = Infinity
      rel.forEach(b => {
        let cDist = this.pos.copy().sub(b.pos).mag()
        if (cDist < closestDist) {
          closestDist = cDist
          closestBoid = b
        }
      })
      if (closestDist < Size * 2) {
        // this.setIt(false)
        closestBoid.tagged = true
        closestBoid.setIt(true)
        return this.wander()
      }
      this.pursue(closestBoid)

    } else {
      rel.forEach(b => {
        this.flee(b.pos)
      })
    }
  }
  applyForce(force) {
    this.acc.add(force)
    this.acc.limit(this.maxForce)
  }
  update() {
    if (this.itCooldown > 0) this.itCooldown--
    this.vel.add(this.acc)
    this.acc.mult(0)
    this.vel.limit(this.wandering && this.wanderCooldown < 1 ? this.wanderSpeed : this.maxSpeed)
    this.pos.add(this.vel)
    this.wrap()
  }
  show() {
    const s = this.size
    push();
    noStroke();
    translate(this.pos.x, this.pos.y)
    if (labeledNames) {
      fill('#ffffff66')
      textSize(18)
      text(this.name, 16, -16)
    }
    rotate(this.vel.heading())
    noStroke()
    fill(this.color);
    if (this.tagged) fill('purple')
    if (this.it) fill('orange')
    quad(-s, -s, 2 * s, 0, -s, s, -s / 2, 0)
    pop()
    if (this.diags.percepRad) {
      stroke('red')
      strokeWeight(1)
      noFill()
      let c = this.percepCenter()
      circle(c.x, c.y, this.percepRad * 2)
    }
  }
  wrap() {
    if (this.pos.x > W) this.pos.x = 0
    if (this.pos.x < 0) this.pos.x = W
    if (this.pos.y > H) this.pos.y = 0
    if (this.pos.y < 0) this.pos.y = H
  }
  getOppositeEdgeAliases(btree) {
    const percepCenter = this.percepCenter()
    let oppositeBoids = []
    let xOff = 0
    if (percepCenter.x < this.percepRad) xOff = W
    else if (percepCenter.x > W - this.percepRad) xOff = -W
    if (xOff) {
      const bds = btree
        .query(new Circle(percepCenter.x + xOff, percepCenter.y, this.percepRad))
        .map(bd => alias(bd.userData))
      bds.forEach(al => al.pos.x = al.pos.x - xOff)
      oppositeBoids.push(...bds)
    }
    let yOff = 0
    if (percepCenter.y < this.percepRad) yOff = H
    else if (percepCenter.y > H - this.percepRad) yOff = -H
    if (yOff) {
      const bds = btree
        .query(new Circle(percepCenter.x, percepCenter.y + yOff, this.percepRad))
        .map(bd => alias(bd.userData))
      bds.forEach(al => al.pos.y = al.pos.y - yOff)
      oppositeBoids.push(...bds)
    }
    if (xOff && yOff) {
      const bds = btree
        .query(new Circle(percepCenter.x + xOff, percepCenter.y + yOff, this.percepRad))
        .map(bd => alias(bd.userData))
      bds.forEach(al => {
        al.pos.x = al.pos.x - xOff
        al.pos.y = al.pos.y - yOff
      })
      oppositeBoids.push(...bds)
    }

    // if (oppositeBoids.length > 0) console.log(oppositeBoids)
    return oppositeBoids

  }
  percepCenter() {
    return this.vel.copy().setMag(this.percepRad / 2).add(this.pos)
  }
  percepBoundary(c) {
    if (c == undefined) c = this.percepCenter()
    return new Circle(c.x, c.y, this.percepRad)
  }
}