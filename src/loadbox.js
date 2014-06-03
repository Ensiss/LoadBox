ImageData.prototype.getPixel = function(x, y) {
    var idx = (y * this.width + x) * 4;
    var col = 0;
    // col |= this.data[idx + 3] << 24;
    col |= this.data[idx + 0] << 16;
    col |= this.data[idx + 1] << 8;
    col |= this.data[idx + 2] << 0;
    return (col);
};

ImageData.prototype.setPixel = function(x, y, col) {
    var idx = (y * this.width + x) * 4;
    this.data[idx + 3] = 255; //(col >> 24) & 255;
    this.data[idx + 0] = (col >> 16) & 255;
    this.data[idx + 1] = (col >> 8) & 255;
    this.data[idx + 2] = col & 255;
};

(function(window) {
    "use strict";

    var LoadBox = function(type, params) {
	var init = "LoadBox_init" + type.charAt(0).toUpperCase() + type.slice(1);
	if (!window[init])
	    return (false);
	if (!params)
	    params = {};
	if (!params.container || !(this._parent = document.getElementById(params.container)))
	    this._parent = document.body;
	this._params = params;
	this._div = this._addElement("div", this._parent);
	this._canvas = this._addElement("canvas", this._div);
	this._canvas.width = params.width || 100;
	this._canvas.height = params.height || 100;
	this._ctx = this._canvas.getContext("2d");
	this._fps = params.fps || 25;

	window[init](this);
	this.hide();
    };

    LoadBox.prototype.step = function() {};

    LoadBox.prototype.visible = function() {
	return (!!this._interval);
    };

    LoadBox.prototype.show = function() {
	if (this.visible())
	    return;
	var func = this.step;
	this._interval = setInterval(function() { func() }, 1000 / this._fps);
	this._div.style.display = "block";
    };

    LoadBox.prototype.hide = function() {
	if (!this.visible())
	    return;
	clearInterval(this._interval);
	this._interval = null;
	this._div.style.display = "none";
    };

    LoadBox.prototype.toggle = function() {
	if (this.visible())
	    this.hide();
	else
	    this.show();
    };

    LoadBox.prototype._addElement = function(tag, parent) {
	var elem = document.createElement(tag);
	parent.appendChild(elem);
	return (elem);
    };

    window.LoadBox = LoadBox;
}(window));
