First attempt to implement [Dual Contouring](http://www.frankpetterson.com/publications/dualcontour/dualcontour.pdf)

 - 2D case on a simple grid
 - [mathjs](http://mathjs.org/) for vector/matrix manipulation
 - [p5js](https://p5js.org) to interactively visualize the result

**Overview**

 1. Partition space into a grid
 2. Add a surface function (just a circle)
 3. Iterate over vertices, marking densities (solid or air)
 4. Iterate over edges, marking surface intercept positions and normals
 5. Iterate over cells, positioning vertices by [minimizing quadratic error function](https://stackoverflow.com/a/31188308)
 6. Iterate over cells, connecting adjacent vertices with faces (in 2d, just lines)

Most of the work is done in `simplegrid.js`

[Interactive demo](https://AdamStone.github.io/dual-contouring-2d-grid) (only tested in Chrome)
