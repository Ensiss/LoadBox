LoadBox
==========

HTML5/javascript modular loader based on canvas.

## Documentation

### Hourglass loader

```js
var loader = new LoadBox("hourglass", {
    container: "container-id", // (default = document body)
    width: 100, // Width of the loader
    height: 100, // Height of the loader
    fps: 25, // Number of frames per second

    spawnBorder: 7, // Number of pixels in the hourglass where the sand does not spawn
    holeSize: 3, // Size of the hourglass hole
    stepsPerRotation: 500, // How long before the hourglass rotates
    stepsPerFrame: 5, // Number of simulation steps per frame
    fluidity: 0.8 // How fast the sand will spread
});
loader.show();
```

### Conway's Game Of Life loader

```js
var loader = new LoadBox("gameoflife", {
    container: "container-id", // (default = document body)
    width: 100, // Width of the loader
    height: 100, // Height of the loader
    fps: 25, // Number of frames per second

    aliveProba: 0.5, // Chance that each cell will spawn alive
    warp: true, // If the borders are connected
    mapWidth: 20, // Number of horizontal cells
    mapHeight: 20 // Number of vertical cells
    patterns: [
    ["glider",
    " o",
    "  o",
    "ooo"]], // Array of patterns used to create a scene
    init: [
    {name: "glider", x:0, y:0, flip:false, flop:false}]
});
loader.show();
```

### How to extend ?

Create a .js file that will be loaded before loadbox.js in your html document.
In this file create a function named "LoadBox_init<Module>", that takes the box as parameter.
This function is the constructor of your module, and will have to define the method "step" that will be called each frame.
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
