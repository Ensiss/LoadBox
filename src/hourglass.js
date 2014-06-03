var Sand = (function() {
    "use strict";

    var _color = 0xEDC9AF;
    var _empty = 0xFFFFFF;
    var _gravity = 1;
    var _fluidity = 0.8;

    function Sand(x, y) {
	this._x = parseInt(x);
	this._y = parseInt(y);
    };

    Sand.prototype.invertGravity = function() {
	_gravity *= -1;
    };

    Sand.prototype.setFluidity = function(fluidity) {
	_fluidity = fluidity;
    };

    Sand.prototype.setColor = function(color) {
	_color = color;
    };

    Sand.prototype.erase = function(img) {
	img.setPixel(this._x, this._y, _empty);
	img.data[(this._y * img.width + this._x) * 4 + 3] = 0;
    };

    Sand.prototype.draw = function(img) {
	img.setPixel(this._x, this._y, _color);
	img.data[(this._y * img.width + this._x) * 4 + 3] = 255;
    };

    Sand.prototype.check = function(img, x, y, color) {
	return (img.getPixel(this._x + x, this._y + y) == color);
    };

    Sand.prototype.moveSide = function(img, side) {
	if (this.check(img, side, 0, _empty)) {
	    if (this.check(img, side, _gravity, _empty))
		this._x += side, this._y += _gravity;
	    else if (Math.random() < _fluidity)
		this._x += side;
	    else
		return (false);
	    return (true);
	}
	return (false);
    };

    Sand.prototype.step = function(img) {
	var side = Math.random() > 0.5 ? 1 : -1;

	this.erase(img);

	if (this.check(img, 0, _gravity, _empty))
	    this._y += _gravity;
	else if (!this.moveSide(img, side))
	    this.moveSide(img, -side);

	this.draw(img);
    };

    return (Sand);
})();

function LoadBox_initHourglass(box) {
    var borders = box._params.spawnBorder || 7;
    var holesz = box._params.holeSize || 3;
    var w = box._canvas.width;

    // Second canvas element for rotation
    box._tmpcan = box._addElement("canvas", box._div);
    box._tmpcan.width = box._params.width || 100;
    box._tmpcan.height = box._params.height || 100;
    box._tmpcan.style.display = "none";
    box._tmpctx = box._tmpcan.getContext("2d");

    box._img = box._ctx.createImageData(box._canvas.width, box._canvas.height);
    box._sand = [];
    box._rot = 0;
    box._timer = 0;
    box._nframes = box._params.stepsPerRotation || 500;
    box._rotating = false;
    box._nsteps = box._params.stepsPerFrame || 5;
    box._hgColor = 0x000000;
    if (box._params.hourglassColor != undefined)
	box._hgColor = box._params.hourglassColor;

    // Box and borders
    for (var j = 0; j < box._img.height; j++) {
	for (var i = 0; i < box._img.width; i++) {
	    if (!i || i == box._img.width - 1 || !j || j == box._img.height - 1)
		box._img.setPixel(i, j, box._hgColor);
	    else {
		box._img.setPixel(i, j, 0xFFFFFF);
		box._img.data[(j * w + i) * 4 + 3] = 0;
	    }
	}
    }

    // Sand and hourglass
    for (var i = 0; i < box._img.width; i++) {
    	if (i > borders && i < box._img.height / 2 - borders) {
    	    for (var j = i + borders; j < box._img.width - i - borders; j++) {
    		box._sand.push(new Sand(j, i));
    	    }
    	}
    	box._img.setPixel(i, i, box._hgColor);
    	box._img.setPixel(i, 100 - i, box._hgColor);
    }

    // Hourglass' hole
    for (var j = -holesz; j <= holesz; j++) {
	for (var i = -holesz; i <= holesz; i++) {
	    var x = box._img.width / 2 + i;
	    var y = box._img.height / 2 + j;
	    if (Math.abs(i) == holesz)
		box._img.setPixel(x, y, box._hgColor);
	    else {
		box._img.setPixel(x, y, 0xFFFFFF);
		box._img.data[(y * w + x) * 4 + 3] = 0;
	    }
	}
    }

    if (box._sand.length) {
	if (box._params.fluidity)
	    box._sand[0].setFluidity(box._params.fluidity);
	if (box._params.color != undefined)
	    box._sand[0].setColor(box._params.color);
    }

    // Simulation step
    box.step = function() {
	for (var stepi = 0; stepi < box._nsteps; stepi++) {
	    if (!box._rotating) {
		for (var i in box._sand)
		    box._sand[i].step(box._img);
	    }

	    if (!box._rotating && !(++box._timer % box._nframes))
		box._rotating = true;
	    if (box._rotating) {
		if (!((box._rot += 5) % 180)) {
		    box._rotating = false;
		    box._sand[0].invertGravity();
		}
	    }
	}

	box._tmpctx.putImageData(box._img, 0, 0);
	box._ctx.clearRect(0, 0, box._canvas.width, box._canvas.height);
	box._ctx.save();
	box._ctx.translate(box._img.width / 2, box._img.height / 2);
	box._ctx.rotate(box._rot * Math.PI / 180);
	box._ctx.drawImage(box._tmpcan, -box._img.width / 2, -box._img.height / 2);
	box._ctx.restore();
    };
}
