let fl
let btree
let btreeView = false
let pause = false
let labeledNames = true
let seesAcrossEdges = true
function setup() {
  createCanvas(W, H)
  fl = new Flock(1)
  fl.boids[0].setIt(true)

  // fl.boids[0].diags.wander = true
}
let fr = 0


function draw() {
  if (frameCount % 1 === 0) background(30)
  fill('red')
  noStroke()
  if (frameCount % 20 === 0) fr = frameRate()
  text(fr.toFixed(2) + ' ' + fl.boids.length, 10, 20)

  btree = new QuadTree(new Rectangle(0, 0, W, H), 4)
  for (let boid of fl.boids) {
    btree.insert(new Point(boid.pos.x, boid.pos.y, boid))
  }
  for (let boid of fl.boids) {
    const bdsFmOppositeEdges = seesAcrossEdges ? boid.getOppositeEdgeAliases(btree) : []
    boid.sight = [].concat(btree
      .query(boid.percepBoundary())
      .map(bd => bd.userData),
      bdsFmOppositeEdges
    )

    boid.sight = boid.sight.filter(b => b.id !== boid.id)

    boid.react()
    // boid.wander()
    boid.update()
    if (!btreeView && frameCount % 1 === 0) {
      boid.show()
    }
  }
  if (btreeView) btree.show()


}
function keyPressed() {
  switch (keyCode) {
    case 78:
      random(fl.boids).setIt(true)
      break
    case 81:
      btreeView = !btreeView
      break
    case 80:
      if (pause) {
        loop()
      } else {
        noLoop()
      }
      pause = !pause
      break
    case 49:
      fl.boids.push(new Boid({}))
      break
    case 50:
      for (let i = 0; i < 10; i++) {
        fl.boids.push(new Boid({}))
      }
      break
    case 51:
      for (let i = 0; i < 100; i++) {
        fl.boids.push(new Boid({}))
      }
      break
    case 52:
      for (let i = 0; i < 1000; i++) {
        fl.boids.push(new Boid({}))
      }
      break
    case 48:
      fl = new Flock(0)
      break
    case 76:
      labeledNames = !labeledNames
      break
    case 69:
      seesAcrossEdges = !seesAcrossEdges
      break
  }
}

