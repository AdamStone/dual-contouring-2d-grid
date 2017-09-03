import p5 from 'p5'
window.p5 = p5

import math from 'mathjs'
window.math = math

import Planetoid from './planetoid'
import SimpleGrid from './simplegrid'
import QuadTree from './quadtree'
import {Circle} from './surface'

import { add, subtract, multiply, divide, square, sqrt,
     sum, mean, matrix, zeros, transpose, inv } from 'mathjs'

// grid
const WIDTH = 512
const HEIGHT = WIDTH
const RESOLUTION = WIDTH / 64

// circle
const RADIUS = 125


let mouseOrigin
window.mousePressed = () => {
  mouseOrigin = [mouseX, mouseY]
}
window.mouseReleased = () => {
  mouseOrigin = null
}

let toggleGrid = 2
window.keyPressed = (e) => {
  switch(e.keyCode) {
    case 71:
      toggleGrid = toggleGrid === 1 ? 0 : 1
      break
    case 81:
      toggleGrid = toggleGrid === 2 ? 0 : 2
  }
}

let grid, surface, quadTree
let surfaceOrigin = [WIDTH / 2, HEIGHT / 2 + 40]


window.setup = () => {
  let canvas = createCanvas(WIDTH+1, HEIGHT+1)
  canvas.parent('canvas-container')

  surface = new Planetoid(surfaceOrigin, RADIUS, WIDTH, HEIGHT)
  grid = new SimpleGrid(WIDTH, RESOLUTION)
  grid.addSurface(surface)
  grid.generateMesh()
  quadTree = QuadTree.fromGrid(grid)
}

window.draw = () => {
  background(0)
  if (mouseOrigin) {
    // just reinitialize everything to move the circle
    let mouseNow = [mouseX, mouseY]
    let mouseDelta = subtract(mouseNow, mouseOrigin)
    surfaceOrigin[0] += mouseDelta[0]
    surfaceOrigin[1] += mouseDelta[1]
    mouseOrigin = mouseNow

    grid = new SimpleGrid(WIDTH, RESOLUTION)
    grid.addSurface(surface)
    grid.generateMesh()
    quadTree = QuadTree.fromGrid(grid)
  }

  surface.draw()

  if (toggleGrid === 1) {
    grid.drawGrid()
  }
  if (toggleGrid === 2) {
    quadTree.drawNodes()
  }

  grid.drawMesh()

  noStroke()

  textSize(22)
  fill(120)
  text('Dual contouring in 2D', 10, 25)

  textSize(16)
  fill(75)
  text('Click and drag to move', 10, 50)
  text('Press G to toggle grid', 10, 100)
  text('Press Q to toggle quadtree', 10, 75)
}
