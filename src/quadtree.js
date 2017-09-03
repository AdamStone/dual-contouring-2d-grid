
import _ from 'lodash'
import math from 'mathjs'

import { add, subtract, multiply, divide, square, sqrt, range,
     min, max, sum, mean, matrix, zeros, transpose, inv } from 'mathjs'

class QuadTree {
  static fromGrid(grid) {
    let recursor = (cells, origin, resolution) => {
      if (typeof cells.size === 'function') {
        // can potentially subdivide further
        let n = cells.size()[0]     // number of cells

        if (_.some(_.flatten(cells.toArray()))) {
          // should further subdivide

          let n2 = n / 2              // half number of cells
          let l2 = n2 * resolution    // half total length
          let r0 = range(0, n2)
          let r1 = range(n2, n)
          let quadrants = ([
           {range: [r0, r0], origin: origin},
           {range: [r0, r1], origin: add(origin, [0, l2])},
           {range: [r1, r0], origin: add(origin, [l2, 0])},
           {range: [r1, r1], origin: add(origin, [l2, l2])}
          ])
          let children = quadrants.map(quadrant => {
            let subCells = cells.subset(math.index(...quadrant.range))
            return recursor(subCells, quadrant.origin, resolution)
          })
          return new QuadTree(resolution * n, origin, resolution, children)

        }
        else {
          // homogeneous region
          return new QuadTree(resolution * n, origin, resolution)
        }
      }
      else {
        // reached the smallest grid unit
        let leaf = new QuadTree(resolution, origin, resolution)
        leaf.data = cells
        return leaf
      }
    }

    return recursor(grid.cells, grid.origin, grid.resolution)
  }

  constructor(size, origin, resolution, children = []) {
    this.size = size
    this.resolution = resolution
    this.origin = origin || [0, 0]

    this.children = children
  }

  drawNodes() {
    // just the octree node squares (not the mesh)
    stroke(color(255,255,255,15))
    noFill()
    rect(...this.origin, this.size, this.size)
    this.children.forEach(subTree => subTree ? subTree.drawNodes() : null)
  }

}

export default QuadTree
