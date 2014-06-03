var ProximityManager = (function() {
    "use strict";

    var _w;
    var _h;
    var _nodes;
    var _nodex;
    var _nodey;
    var _map;
    var _clear;

    function ProximityManager(w, h, div) {
	_w = w;
	_h = h;
	_nodes = div;
	_nodex = _w / _nodes;
	_nodey = _h / _nodes;
	_clear = [];
	_map = new Array(_nodes);
	for (var y = 0; y < _nodes; y++) {
	    _map[y] = new Array(_nodes);
	    for (var x = 0; x < _nodes; x++)
		_map[y][x] = {elms:[], cache:[], cached:false}
	}
    };

    ProximityManager.prototype.addElement = function(elm) {
	var x = parseInt(elm.x / _nodex);
	var y = parseInt(elm.y / _nodey);
	if (x < 0 || x >= _nodes || y < 0 || y >= _nodes)
	    return (false);
	if (!_map[y][x].elms.length)
	    _clear.push(y * _nodes + x);
	_map[y][x].elms.push(elm);
	return (true);
    };

    ProximityManager.prototype.clear = function() {
	for (var i in _clear) {
	    var n = _clear[i];
	    var node = _map[parseInt(n / _nodes)][n % _nodes];
	    node.elms = [];
	    node.cache = [];
	    node.cached = false;
	}
	_clear = [];
    };

    ProximityManager.prototype.query = function(x, y) {
	x = parseInt(x / _nodex);
	y = parseInt(y / _nodey);
	if (x < 0 || x >= _nodes || y < 0 || y >= _nodes)
	    return (false);
	var node = _map[y][x]
	if (!node.cached) {
	    for (var j = -1; j <= 1; j++) {
		for (var i = -1; i <= 1; i++) {
		    if (x + i >= 0 && x + i < _nodes && y + j >= 0 && y + j < _nodes)
			node.cache = node.cache.concat(_map[y + j][x + i].elms);
		}
	    }
	    node.cached = true;
	}
	return (node.cache);
    };

    return (ProximityManager);
})();

var Particle = (function() {
    "use strict";

    function Particle(px, py) {
	this.x = px;
	this.y = py;
	this.vx = 0;
	this.vy = 200;
	this.oldx = px;
	this.oldy = py;
    };

    return (Particle);
})();

function LoadBox_initFountain(box) {
    box._img = box._ctx.createImageData(box._canvas.width, box._canvas.height);
    box._manager = new ProximityManager(box._img.width, box._img.height, box._img.width / 20);
    box._list = [];
    box._color = box._params.color == undefined ? 0x0000FF : box._params.color;

    // Timestep
    box._ts = 1.0 / 40;
    box._ts2 = box._ts * box._ts;

    // Simulation tweaks
    box._grav = box._params.gravity || 100;
    box._radius = box._params.radius || 20;
    box._theta = box._params.theta || 1;
    box._beta = box._params.beta || 0;
    box._stiff = box._params.stiffness || 200;
    box._stiff_n = box._params.stiffness2 || 40;
    box._density = box._params.density || 5;
    box._friction = box._params.friction || 0;

    // Spawn particles
    for (var j = 50; j < box._img.height; j += 3) {
	for (var i = -25; i <= 25; i += 10) {
	    box._list.push(new Particle(box._img.width / 2 + i, j + i % 5));
	}
    }

    function pow(x) { return (x * x); };

    function applyViscosity() {
	var neighbors;
	var rvx, rvy, vx, vy, vd, ix, iy;
	var r, q, u;

	for (var it in box._list) {
	    var i = box._list[it];
	    if (!(neighbors = box._manager.query(i.x, i.y)))
		continue;
	    for (var nit in neighbors) {
		var j = neighbors[nit];
		if (i == j)
		    continue;
		r = Math.sqrt(pow(j.x - i.x) + pow(j.y - i.y));
		if ((q = r / box._radius) < 1) {
		    rvx = (j.x - i.x) / r;
		    rvy = (j.y - i.y) / r;
		    vx = i.vx - j.vx;
		    vy = i.vy - j.vy;
		    vd = Math.sqrt(vx * vx + vy * vy);
		    if ((u = rvx * vx + rvy * vy) > 0) {
			iy = box._ts * (1 - q) * (box._theta * u + box._beta * u * u);
			ix = (iy * rvx) / 2.0;
			iy = (iy * rvy) / 2.0;
			i.vx -= ix;
			i.vy -= iy;
			j.vx += ix;
			j.vy += iy;
		    }
		}
	    }
	}
    };

    function doubleDensityRelaxation() {
	var neighbors;
	var phi, phi_n, press, press_n;
	var r, q, dxx, dxy, dx, dy;

	for (var it in box._list) {
	    var i = box._list[it];
	    if (!(neighbors = box._manager.query(i.x, i.y)))
		continue;
	    phi = phi_n = 0;
	    for (var nit in neighbors) {
		var j = neighbors[nit];
		if (i == j)
		    continue;
		r = Math.sqrt(pow(j.x - i.x) + pow(j.y - i.y));
		if ((q = r / box._radius) < 1) {
		    q = 1 - q;
		    phi += q * q;
		    phi_n += q * q * q;
		}
	    }
	    press = box._stiff * (phi - box._density);
	    press_n = box._stiff_n * phi_n;
	    dxx = dxy = 0;
	    for (var nit in neighbors) {
		var j = neighbors[nit];
		if (i == j)
		    continue;
		r = Math.sqrt(pow(j.x - i.x) + pow(j.y - i.y));
		if (r != 0 && (q = r / box._radius) < 1) {
		    dy = box._ts2 * (press * (1 - q) + press_n * pow(1 - q));
		    dx = dy * ((j.x - i.x) / r);
		    dy = dy * ((j.y - i.y) / r);
		    j.x += dx;
		    j.y += dy;
		    dxx -= dx;
		    dxy -= dy;
		}
	    }
	    i.x += dxx;
	    i.y += dxy;
	}
    };

    function resolveCollisions() {
	for (var it in box._list) {
	    var i = box._list[it];
	    if (i.y >= box._img.height - 5 || i.y < 0) {
		i.vy *= -1;
		i.y = i.y < 0 ? 0 : box._img.height - 5;
	    }
	    if (i.x >= box._img.width - 5 || i.x < 0) {
		i.vx *= -1;
		i.x = i.x < 0 ? 0 : box._img.width - 5;
	    }
	}
    };

    box.step = function() {
	box._manager.clear();
	// Set particles old position and reset proximity manager
	for (var i in box._list) {
	    var p = box._list[i];
	    box._manager.addElement(p);
	    box._img.setPixel(parseInt(p.x), parseInt(p.y), 0xFFFFFF);
	    box._img.data[(parseInt(p.y) * box._img.width + parseInt(p.x)) * 4 + 3] = 0;
	    p.oldx = p.x;
	    p.oldy = p.y;
	    p.vy += box._grav * box._ts;
	}
	applyViscosity();
	// Move particles
	for (var i in box._list) {
	    var p = box._list[i];
	    p.x += p.vx * box._ts;
	    p.y += p.vy * box._ts;
	}
	doubleDensityRelaxation();
	resolveCollisions();
	for (var i in box._list) {
	    var p = box._list[i];
	    // Update velocity
	    p.vx = (p.x - p.oldx) / box._ts;
	    p.vy = (p.y - p.oldy) / box._ts;
	    // Fountain effect
	    if (Math.abs(p.x - box._img.width / 2) < 10 && box._img.height - p.y < 75) {
		p.vy -= 10;
		p.vx /= 2;
	    }
	    // Display the particle
	    box._img.setPixel(parseInt(p.x), parseInt(p.y), box._color);
	    box._img.data[(parseInt(p.y) * box._img.width + parseInt(p.x)) * 4 + 3] = 255;
	}
	box._ctx.putImageData(box._img, 0, 0);
    };
}
