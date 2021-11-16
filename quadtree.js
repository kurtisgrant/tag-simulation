class Point {
  constructor(x, y, userData) {
    this.x = x,
      this.y = y,
      this.userData = userData
  }
}
class Circle {
  constructor(x, y, r) {
    this.x = x,
      this.y = y,
      this.r = r
  }
  contains(point) {
    return (Math.hypot(point.x - this.x, point.y - this.y) < this.r)
  }
  show() {
    noFill()
    stroke('green')
    strokeWeight(2)
    circle(this.x, this.y, this.r * 2)
  }

}
class Rectangle {
  constructor(x, y, w, h) {
    this.x = x,
      this.y = y,
      this.w = w,
      this.h = h
  }
  contains(point) {
    return (point.x >= this.x
      && point.y >= this.y
      && point.x < this.x + this.w
      && point.y < this.y + this.h)
  }
  intersects(range) {
    if (range instanceof Rectangle) {
      return (range.x < this.x + this.w
        || range.y < this.y + this.h
        || range.x + range.w > this.x
        || range.y + range.h > this.y)
    } else if (range instanceof Circle) {
      let Xn = Math.max(this.x, Math.min(range.x, this.x + this.w))
      let Yn = Math.max(this.y, Math.min(range.y, this.y + this.h))
      let Dx = Xn - range.x;
      let Dy = Yn - range.y;
      return (Dx * Dx + Dy * Dy) <= range.r * range.r;
    }
  }
}
class QuadTree {
  constructor(boundary, cap) {
    this.boundary = boundary,
      this.capacity = cap,
      this.points = [],
      this.divided = false
  }
  subdivide() {
    const b = this.boundary

    const nw = new Rectangle(b.x, b.y, b.w / 2, b.h / 2)
    this.northwest = new QuadTree(nw, this.capacity);
    const ne = new Rectangle(b.x + b.w / 2, b.y, b.w / 2, b.h / 2)
    this.northeast = new QuadTree(ne, this.capacity);
    const sw = new Rectangle(b.x, b.y + b.h / 2, b.w / 2, b.h / 2)
    this.southwest = new QuadTree(sw, this.capacity);
    const se = new Rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2)
    this.southeast = new QuadTree(se, this.capacity);

    this.divided = true
  }
  insert(point) {
    if (!this.boundary.contains(point)) return
    if (this.points.length < this.capacity) {
      this.points.push(point)
      return
    } else if (!this.divided) {
      this.subdivide()
    }
    this.northwest.insert(point)
    this.northeast.insert(point)
    this.southwest.insert(point)
    this.southeast.insert(point)
  }
  query(range) {
    let results = []
    if (!this.boundary.intersects(range)) return results
    for (let p of this.points) {
      if (range.contains(p)) results.push(p)
    }
    if (this.divided) {
      results = [...results,
      ...this.northwest.query(range), ...this.northeast.query(range),
      ...this.southwest.query(range), ...this.southeast.query(range)]
    }
    return results
  }
  show() {
    const b = this.boundary
    strokeWeight(1)
    stroke('green')
    noFill()
    rect(b.x, b.y, b.w, b.h)
    for (let p of this.points) {
      strokeWeight(3)
      point(p.x, p.y)
    }
    if (this.divided) {
      this.northwest.show()
      this.northeast.show()
      this.southwest.show()
      this.southeast.show()
    }
  }
}
