
class Surface {
  constructor(generator, origin, radius, width, height, index = 1) {
    this.generator = generator(origin, radius)
    this.origin = origin
    this.radius = radius
    this.index = index
    this.width = width
    this.height = height
  }

  get(x, y) {
    return this.generator(x, y)
  }

  getIndex(x, y) {
    return this.get(x, y) < 0 ? this.index : 0
  }
}

let circleGenerator = (origin, r0) => {
  return (x, y) => {
    let [x0, y0] = origin
    let [X, Y] = [x-x0, y-y0]

    let value = (X*X + Y*Y - r0*r0)

    return value
  }
}
class Circle extends Surface {
  constructor(origin, radius, width, height, index = 1) {
    super (circleGenerator, origin, radius, width, height, index)
  }

  draw() {
    noFill()
    stroke(100)
    ellipse(...this.origin, this.radius * 2, this.radius * 2)
  }
}

export {Circle}
export default Surface
