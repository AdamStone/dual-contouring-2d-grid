
let baseRanges = {
  'perlin2': [-Math.sqrt(2/4), Math.sqrt(2/4)],
  'perlin3': [-Math.sqrt(3/4), Math.sqrt(3/4)],
  'simplex2': [-1, 1],
  'simplex3': [-1, 1]
}

class NoiseMap {
  constructor({amplitude = 1, octaves = 3, scale = 0.005, lacunarity = 2, seed = 0, type = 'perlin2'}) {
    this.amplitude = amplitude
    this.octaves = octaves
    this.scale = scale
    this.lacunarity = lacunarity
    this.seed = seed
    this.type = type
  }

  get(x, y, lmin, lmax) {
    // centered on zero
    Noise.seed(this.seed)
    let value = 0
    let gradX = 0
    let gradY = 0
    let amplitude = this.amplitude
    let scale = this.scale
    for (let i = 0; i < this.octaves; i++) {
      let n = Noise[this.type](x * scale, y * scale)
      value += amplitude * n.value
      gradX += amplitude * n.gradX
      gradY += amplitude * n.gradY
      scale *= this.lacunarity
      amplitude /= this.lacunarity
    }
    // linear interpolation of the result to the requested range
    if (lmin != null && lmax != null) {
      // new target range
      let rng = lmax - lmin

      // shift from [this.min() -> this.max()] to [0 -> 2*this.max()]
      value -= this.min()

      // scale to target range
      let rescaling = rng / (2*this.max())
      value *= rescaling
      gradX *= rescaling
      gradY *= rescaling

      // shift by target min
      value += lmin
    }
    return {value, gradX, gradY}
  }

  range() {
    if (!this._range) {
      let min = 0
      let max = 0
      let amplitude = this.amplitude
      for (let i = 0; i < this.octaves; i++) {
        min += amplitude * baseRanges[this.type][0]
        max += amplitude * baseRanges[this.type][1]

        amplitude /= this.lacunarity
      }
      this._range = [min, max]
    }
    return this._range
  }

  min() {
    if (!this._min) {
      this._min = this.range()[0]
    }
    return this._min
  }

  max() {
    if (!this._max) {
      this._max = this.range()[1]
    }
    return this._max
  }

  draw(dx, dy) {
    if (!this.img) {
      let img = this.img = createImage(dx, dy)
      img.loadPixels()
      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          let { value, gradient } = this.get(i, j)
          let solid = (value - this.min()) / 2 * 255
          img.set(i, j, color(solid))
        }
      }
      img.updatePixels()
    }
    image(this.img, 0, 0, dx, dy)
  }
}

export default NoiseMap
