LoadBox
==========

HTML5/javascript modular loader based on canvas.

I also made a very basic [demo](http://ensiss.github.io/LoadBox/).

## Documentation

### API

Here is the generic code used to initialize a new loader and the arguments that you can pass to any module.
```js
var loader = new LoadBox("modulename", {
    container: "container-id", // (default = document body)
    width: 100, // Width of the loader
    height: 100, // Height of the loader
    fps: 25, // Number of frames per second
}
loader.show();
```
Then you have to control the state of the loader to decide if it should be displayed or hidden by using the methods `show`, `hide` and `toggle`. To check the current state of the loader, use the `visible` method.

### Fountain loader

This simulation is an implementation of:

> Simon Clavet, Philippe Beaudoin, and Pierre Poulin

> [Particle-based Viscoelastic Fluid Simulation](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.59.9379&rep=rep1&type=pdf)

> SIGGRAPH 2005

```js
var loader = new LoadBox("fountain", {
    color: 0x0000FF, // Color of the particles
    blob: false, // Render blobs instead of particles (**beta**)
    blobr: 10, // Radius of the blobs (**beta**)
    // Simulation tweaks
    gravity: 100,
    radius: 20,
    theta: 1,
    beta: 0,
    stiffness: 200,
    stiffness2: 40,
    density: 5,
    friction: 0
});
```

### Conway's Game Of Life loader

```js
var loader = new LoadBox("gameoflife", {
    aliveProba: 0.5, // Chance that each cell will spawn alive
    warp: true, // If the borders are connected
    mapWidth: 20, // Number of horizontal cells
    mapHeight: 20, // Number of vertical cells
    cellColor: "#000000", // Color of an alive cell
    deadColor: "#FFFFFF", // Color of a dead cell
    gridColor: "#000000", // Color of the grid. The grid is not drawn if this is not defined
    gridThickness: 0, // Thickness of the grid lines
    patterns: [ // Array of patterns used to create a scene
    ["glider",
    " o",
    "  o",
    "ooo"]],
    init: [ // Array of patterns, where and how to put them
    {name: "glider", x:0, y:0, flip:false, flop:false}]
});
```

### Hourglass loader

```js
var loader = new LoadBox("hourglass", {
    spawnBorder: 7, // Number of pixels in the hourglass where the sand does not spawn
    holeSize: 3, // Size of the hourglass hole
    stepsPerRotation: 500, // How long before the hourglass rotates
    stepsPerFrame: 5, // Number of simulation steps per frame
    fluidity: 0.8, // How fast the sand will spread
    color: 0xEDC9AF, // Color of the sand
    hourglassColor: 0x000000 // Color of the hourglass
});
```

### How to extend ?

Create a .js file for your module with a function `LoadBox_init<Module>` in it, that takes the box as parameter.
This function is the constructor of your module, and will have to define the method `step` that will be called each frame.
```js
function LoadBox_initHourglass(box) {
    // Initialisation of the module
    // ...

    // Definition of the step function
    box.step = function() {
        // Simulate the step
        // ...

        // Render the step
        box._ctx.drawImage(...);
    };
}
```
To code your module you will have at your disposal the following attributes:
```js
box._params; // Parameters passed to the box
box._div; // div tag containing all your stuff
box._parent; // Where the previously defined div tag were created
box._canvas; // The canvas element
box._ctx; // 2d context of the canvas element
box._fps; // Number of frames per second
```
