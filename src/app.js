import p5 from 'p5'
window.p5 = p5

import math from 'mathjs'
window.math = math

import Surface from './surface'
import SimpleGrid from './simplegrid'

import { add, subtract, multiply, divide, square, sqrt,
     sum, mean, matrix, zeros, transpose, inv } from 'mathjs'


// grid
const WIDTH = 500
const HEIGHT = WIDTH
const RESOLUTION = 25

// circle
const RADIUS = 150


let mouseOrigin
window.mousePressed = () => {
  mouseOrigin = [mouseX, mouseY]
}
window.mouseReleased = () => {
  mouseOrigin = null
}

let toggleGrid = true
window.keyPressed = (e) => {
  if (e.keyCode === 71) {  // g
    toggleGrid = !toggleGrid
  }
}

let grid, surface
let circleOrigin = [WIDTH / 2, HEIGHT / 2]
let circleGenerator = (origin, r0) => {
  return (x, y) => {
    let [x0, y0] = origin
    let [X, Y] = [x-x0, y-y0]

    let value = X*X + Y*Y - r0*r0  // distance field
    let gradX = 2*X
    let gradY = 2*Y

    return { value, gradX, gradY }
  }
}

window.setup = () => {
  let canvas = createCanvas(WIDTH, HEIGHT)
  canvas.parent('canvas-container')

  surface = new Surface( circleGenerator(circleOrigin, RADIUS) )
  grid = new SimpleGrid(WIDTH, RESOLUTION)
  grid.addSurface(surface)
  grid.generateMesh()
}

window.draw = () => {
  background(0)
  if (mouseOrigin) {
    // just reinitialize everything to move the circle
    let mouseNow = [mouseX, mouseY]
    let mouseDelta = subtract(mouseNow, mouseOrigin)
    circleOrigin[0] += mouseDelta[0]
    circleOrigin[1] += mouseDelta[1]
    mouseOrigin = mouseNow

    grid = new SimpleGrid(WIDTH, RESOLUTION)
    grid.addSurface(surface)
    grid.generateMesh()
  }

  if (toggleGrid) {
    grid.drawGrid()
  }

  grid.drawMesh()

  noStroke()

  textSize(22)
  fill(120)
  text('Dual contouring on a 2D grid', 10, 25)

  textSize(16)
  fill(50)
  text('Click and drag to move,', 10, 50)
  text('Press G to toggle grid', 10, 75)
}
