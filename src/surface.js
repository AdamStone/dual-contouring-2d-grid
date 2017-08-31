
class Surface {
  constructor(generator, index = 1) {
    this.generator = generator
    this.index = index
  }

  getDistance(x, y) {
    return this.generator(x, y)
  }

  getIndex(x, y) {
    let { value, gradX, gradY } = this.getDistance(x, y)
    return {
      value: value < 0 ? this.index : 0,
      gradX,
      gradY
    }
  }

  draw(x0, y0, dx, dy) {
    if (!this.img) {
      let img = this.img = createImage(dx, dy)
      img.loadPixels()
      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          let { value } = this.getIndex(x0 + i, y0 + j)
          img.set(i, j, value > 0 ? color(15) : color(0))
        }
      }
      img.updatePixels()
    }
    image(this.img, 0, 0, dx, dy)
  }
}

export default Surface
