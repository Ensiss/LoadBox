function LoadBox_initGameoflife(box) {
    box._prob = box._params.aliveProba || 0.5;
    box._w = box._params.mapWidth || 20;
    box._h = box._params.mapHeight || 20;
    box._nw = box._canvas.width / box._w;
    box._nh = box._canvas.height / box._h;
    box._warp = box._params.warp == undefined ? true : box._params.warp;
    box._i = false;
    box._alive = [];
    box._check = [];
    box._map = [];
    box._map[false] = new Array(box._w * box._h);
    box._map[true] = new Array(box._w * box._h);

    for (var j = box._w * box._h - 1; j >= 0; j--) {
    	if ((box._map[false][j] = Math.random() < box._prob ? 1 : 0))
    	    box._alive.push(j);
    }

    function idx(x, y) {
	return (y * box._w + x);
    }

    function getX(idx) {
	return (idx % box._w);
    }

    function getY(idx) {
	return (parseInt(idx / box._w));
    }

    box.step = function() {
	box._check = [];
	for (var i = box._w * box._h - 1; i >= 0; i--)
	    box._map[!box._i][i] = 0;
	for (var i in box._alive) {
	    for (var y = -1; y <= 1; y++) {
		for (var x = -1; x <= 1; x++) {
		    if (y || x) {
			var cx = getX(box._alive[i]) + x;
			var cy = getY(box._alive[i]) + y;
			if (box._warp) {
			    cx = (cx + box._w) % box._w;
			    cy = (cy + box._h) % box._h;
			} else if (cx < 0 || cy < 0 || cx >= box._w || cy >= box._h)
			    continue;
			var n = idx(cx, cy);
			if (box._map[!box._i][n] == 0)
			    box._check.push(n);
			box._map[!box._i][n]++;
		    }
		}
	    }
	}

	box._alive = [];
	for (var i in box._check) {
	    var n = box._map[!box._i][box._check[i]];
	    var p = box._map[box._i][box._check[i]];
	    if (n == 3 || (n == 2 && p)) {
		box._alive.push(box._check[i]);
		box._map[!box._i][box._check[i]] = 1;
	    } else
		box._map[!box._i][box._check[i]] = 0;
	}
	box._i = !box._i;

	box._ctx.clearRect(0, 0, box._canvas.width, box._canvas.height);
	box._ctx.fillStyle = "#000000"
	for (var i in box._alive) {
	    box._ctx.fillRect(getX(box._alive[i]) * box._nw, getY(box._alive[i]) * box._nh, box._nw, box._nh);
	}
    };
}
