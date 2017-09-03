
import _ from 'lodash'
import math from 'mathjs'

import { add, subtract, multiply, divide, square, sqrt, sin, cos, atan2,
     min, max, sum, mean, matrix, zeros, transpose, inv } from 'mathjs'

import NoiseMap from './noisemap'


let noiseMap = new NoiseMap({
  octaves: 3,
  lacunarity: 4,
  scale: 2e-2
})

let modMin = 0
let modMax = 100

class Planetoid {
  constructor(origin, radius, width, height, index = 1) {
    this.origin = origin
    this.radius = radius
    this.width = width
    this.height = height
    this.index = index
  }

  // x = r cos(theta)
  // y = r sin(theta)
  // r = sqrt(x^2 + y^2)
  // theta = atan2(y, x)

  getHeight(theta) {
    let [sx, sy] = [this.radius * cos(theta), this.radius * sin(theta)]
    return this.radius + noiseMap.get(sx, sy, modMin, modMax).value
  }

  get(x, y) {  // "density" function
    [x, y] = subtract([x, y], this.origin)
    let d2 = sum(square([x, y]))
    let r = this.getHeight(atan2(y, x))
    return d2 - r*r
  }

  getIndex(x, y) {
    return this.get(x, y) < 0 ? this.index : 0
  }

  draw() {
    for (let i = 0; i < this.width; i+=4) {
      for (let j = 0; j < this.height; j+=4) {
        let index = this.getIndex(i, j)
        if (index > 0) {
          stroke(30)
          fill(30)
          point(i, j)
        }
      }
    }
  }
}

export default Planetoid
