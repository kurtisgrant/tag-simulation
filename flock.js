class Flock {
  constructor(num) {
    this.num = num
    this.boids = []

    for (let i = 0; i < this.num; i++) {
      this.boids.push(new Boid({}))
    }

  }
  named(name) {
    return this.boids.filter(b => b.name.toLowerCase() === name.toLowerCase())
  }
  set(name, speed, force, percepRad, it) {
    const bd = this.named(name)[0]
    bd.maxSpeed = speed
    bd.maxForce = force
    bd.percepRad = percepRad
    bd.setIt(it)
  }
  setupEdgePercepTestFlock() {
    this.boids = []
    this.boids.push(new Boid({
      pos: createVector(100, 100),
      vel: createVector(-1, 0.1),
      percepRad: 300,
      fitness: 1,
      speed: 1,
      agility: 1,
      diags: { percepRad: true }
    }))
    this.boids.push(new Boid({
      pos: createVector(W - 100, 250),
      vel: createVector(-1, 0.1),
      percepRad: 300,
      fitness: 1,
      agility: 1
    }))
    this.boids.push(new Boid({
      pos: createVector(120, H - 100),
      vel: createVector(-1, 0.1),
      percepRad: 300,
      fitness: 1,
      agility: 1
    }))
  }
  makeFastestIt() {
    let fastest = { maxSpeed: 0 }
    this.boids.forEach((b => {
      if (b.maxSpeed > fastest.maxSpeed) fastest = b
    }))
    fastest.setIt(true)
    return fastest
  }
  modify(popPercent, multiplier, keys, color) {
    for (let i = 0; i < this.boids.length; i++) {
      if (random() * 100 < popPercent) {
        if (color) this.boids[i].color = color
        for (let key of keys) {
          let prop = this.boids[i][key]
          this.boids[i][key] = prop * multiplier
        }
      }
    }
  }
}