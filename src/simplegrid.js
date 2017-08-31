
import _ from 'lodash'
import math from 'mathjs'

import { add, subtract, multiply, divide, square, sqrt,
     min, max, sum, mean, matrix, zeros, transpose, inv } from 'mathjs'

let pinv = function(A) {
  let AT = transpose(A)
  return multiply(inv(multiply(AT, A)), AT)
}

let normalize = function(vector) {
  return divide(vector, sqrt(sum(square(vector))))
}

const MAX_ERR = .1

class SimpleGrid {
  constructor(size, resolution, origin) {
    this.origin = origin || [0, 0]
    this.resolution = resolution
    this.size = size
    this.nCells = size / resolution
    this.nPoints = this.nCells + 1
    this.surfaces = []

    this.points = zeros(this.nPoints, this.nPoints)
    this.hEdges = zeros(this.nCells, this.nPoints)
    this.vEdges = zeros(this.nPoints, this.nCells)
    this.cells = zeros(this.nCells, this.nCells)

    this.faces = []
  }

  getXY(ij) {
    return add(this.origin, multiply(ij, this.resolution))
  }

  addSurface(surface) {
    this.surfaces.push(surface)
  }

  generateMesh() {
    let surface = this.surfaces[0]

    this.generateGridPointData(surface)
    this.generateGridEdgeData(surface)
    this.generateMeshVertices(surface)
    this.generateMeshFaces(surface)
  }

  generateGridPointData(surface) {
    // generate material index data at grid points

    let { points, origin, resolution } = this

    this.points = points = points.map((v, ij) => {
      return surface.getIndex(...this.getXY(ij)).value
    })
  }

  generateGridEdgeData(surface) {
    // generate edge intercepts and surface normals

    let { points, hEdges, vEdges, origin, resolution } = this

    let mapFn = function(step, e, ij) {
      let xy = this.getXY(ij)

      let v1 = points.subset(math.index(...ij))
      let v2 = points.subset(math.index(...add(ij, step)))
      if (v2 !== v1) {
        // edge crosses a surface
        // assume we don't know the form of the generator gradient,
        // find intersection with simple binary search
        let err = resolution  // length of iteration step
        // iteratively get position of surface crossing
        let sxy = [...xy]
        let value, gradX, gradY, sign
        while (err > MAX_ERR) {
          ({ value, gradX, gradY } = surface.getIndex(...sxy))
          err /= 2
          sign = value === v2 ? -1 : 1
          sxy = add(sxy, multiply(step, sign * err))
        }
        return {
          origin: xy,
          intercept: subtract(sxy, xy),
          normal: normalize([gradX, gradY])
        }
      }
      return 0
    }
    this.hEdges = hEdges = hEdges.map(mapFn.bind(this, [1, 0]))
    this.vEdges = vEdges = vEdges.map(mapFn.bind(this, [0, 1]))
  }

  generateMeshVertices(surface) {
    // generate vertex positions

    let { hEdges, vEdges, cells, resolution } = this

    let edgeMaps = [
      {collection: hEdges, offset: [0, 0]},  // top horizontal edge
      {collection: vEdges, offset: [0, 0]},  // left vertical edge
      {collection: hEdges, offset: [0, 1]},  // bottom horizontal edge
      {collection: vEdges, offset: [1, 0]}   // bottom vertical edge
    ]
    this.cells = cells.map((c, ij) => {
      let xy = this.getXY(ij)

      // get the edges for this cell
      let edges = edgeMaps.map(cfg => {
        let offset = add(ij, cfg.offset)
        return cfg.collection.subset(math.index(...offset))
      })

      // just those that the surface actually crosses
      let crossedEdges = edges.filter(e => e)

      if (crossedEdges.length) {
        // the surface crossed the cell

        // get edge intercept positions relative to the cell origin
        // (rather than relative to edge origin)
        let rel = crossedEdges.map(edge => {
          return {
            normal: edge.normal,
            intercept: subtract(add(edge.origin, edge.intercept), xy)
          }
        })

        // *** find least squares solution by pseudoinverse ***
        // https://stackoverflow.com/a/31188308

        // mean point of intersections
        let m = [
          mean(rel.map(edge => edge.intercept[0])),
          mean(rel.map(edge => edge.intercept[1]))
        ]

        // matrix of normals (one row per edge)
        let A = matrix(rel.map(edge => edge.normal))

        /* vector of dot products of normals and intercepts for each edge
        (The intersection points are 'moved' so that the mean point becomes the origin.
        This ensures that when there are multiple solutions to the QEF, the solution closest
        to the mean point is chosen.) */
        let b = rel.map(edge => multiply(edge.normal, subtract(edge.intercept, m)))

        // pseudoinverse
        let P = pinv(A)
        let leastSqPosition = multiply(P, b).toArray()  // still relative to mean
        let relativeToCell = add(leastSqPosition, m)  // make relative to cell origin

        // if any coordinates landed outside the cell, surface crosses a grid point -
        // just use the mean position
        if (_.some(relativeToCell, (p) => p < 0 || p > resolution)) {
          relativeToCell = m
        }

        return {
          edges,
          origin: xy,
          vertex: relativeToCell
        }
      }
      return 0
    })
  }

  generateMeshFaces(surface) {
    // generate connectivity between vertices (in 3d it would be faces, 2d just lines)

    // to avoid redundancy, for each cell only check right and bottom neighbors
    this.cells.map((cell, ij) => {
      if (cell) {
        let [i, j] = ij
        // if right neighbor exists and has a vertex **and right edge is crossed**
        // (need this edge check to avoid artifacts)
        if (i < this.nCells - 1 && cell.edges[3]) {
          let right = this.cells.subset(math.index(...add(ij, [1, 0])))
          if (right) {
            this.faces.push([add(cell.origin, cell.vertex), add(right.origin, right.vertex)])
          }
        }
        // if bottom neighbor exists and has a vertex **and bottom edge is crossed**
        if (j < this.nCells - 1 && cell.edges[2]) {
          let bottom = this.cells.subset(math.index(...add(ij, [0, 1])))
          if (bottom) {
            this.faces.push([add(cell.origin, cell.vertex), add(bottom.origin, bottom.vertex)])
          }
        }
      }
    })
  }

  drawGrid() {
    // just the grid (not the mesh)
    this.drawEdges()
    this.drawPoints()
    this.drawCells()
  }

  drawPoints() {
    let { origin, resolution } = this
    this.points.forEach((solid, ij) => {
      let xy = this.getXY(ij)
      if (solid) {
        fill(128)
        noStroke()
        ellipse(...xy, 3, 3)
      }
    })
  }

  drawEdges() {
    let uniformColor = 25
    let transitionColor = 50
    let intersectionColor = 255
    let normalColor = color(0, 200, 200)
    let { origin, resolution } = this

    let drawFn = function(step, edge, ij) {
      let xy = this.getXY(ij)

      if (edge) {
        stroke(transitionColor)
      }
      else {
        stroke(uniformColor)
      }

      line(...xy, ...add(xy, multiply(step, resolution)))

      if (edge) {
        let dxy = add(xy, edge.intercept)

        let n = multiply(edge.normal, 10)
        stroke(normalColor)

        line(...dxy, ...add(dxy, n))
      }
    }

    this.hEdges.forEach(drawFn.bind(this, [1, 0]))
    this.vEdges.forEach(drawFn.bind(this, [0, 1]))
  }

  drawCells() {
    let { origin, resolution } = this
    this.cells.forEach((cell, ij) => {
      if (cell) {
        let p = add(cell.origin, cell.vertex)
        fill(color(0, 0, 255))
        noStroke()
        ellipse(...p, 4, 4)
      }
    })
  }

  drawMesh() {
    // just the mesh (not the grid)
    stroke(color(255,255,255,125))
    this.faces.forEach((face) => {
      line(...face[0], ...face[1])
    })
  }
}

export default SimpleGrid
