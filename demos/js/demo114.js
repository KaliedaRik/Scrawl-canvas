var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var i, iz,
		wheelGroup,
		lines = ['top', 'right', 'bottom', 'left'],
		topLeft, topRight, bottomLeft, bottomRight,
		drawLength,
		resizing = true,
		myEntity,
		getCorners,
		c = {},
		a = [],
		getPosition,
		getLength,
		getAngle,
		source,
		sourceCanvas,
		sourceCtx,
		sourceImage,
		easel,
		easelWidth,
		easelHeight,
		easelCtx,
		easelCanvas,
		resultImage,
		resultX,
		resultY,
		resizeEasel,
		setEasel,
		resetEasel,
		paint,
		removeInterferencePatterns,
		getWheel,
		dropWheel,
		stopE;

	// import images
	scrawl.getImagesByClass('demo114');

	// perspective objects
	source = scrawl.addNewCell({
		rendered: false,
		startX: 0,
		startY: 0,
		width: 100,
		height: 100,
		name: 'source'
	});
	sourceCtx = scrawl.context.source;
	sourceCanvas = scrawl.canvas.source;

	easel = scrawl.addNewCell({
		rendered: false,
		startX: 0,
		startY: 0,
		width: 100,
		height: 100,
		name: 'easel'
	});
	easelCtx = scrawl.context.easel;
	easelCanvas = scrawl.canvas.easel;


	sourceImage = scrawl.makePicture({
		name: 'sourceImage',
		group: 'source',
		copyWidth: '100%',
		copyHeight: '100%',
		pasteWidth: '100%',
		pasteHeight: '100%',
		source: 'swan',
		copyX: 0,
		copyY: 0,
		pasteX: 0,
		pasteY: 0
	});

	resultImage = scrawl.makePicture({
		name: 'resultImage',
		order: 5,
		group: 'mycanvas_base',
		copyWidth: '100%',
		copyHeight: '100%',
		pasteWidth: '100%',
		pasteHeight: '100%',
		source: 'easel',
		copyX: 0,
		copyY: 0,
		pasteX: 0,
		pasteY: 0
	});

	// display and control entitys
	wheelGroup = scrawl.makeGroup({
		name: 'wheelGroup',
	});

	for (i = 0; i < 4; i++) {
		scrawl.makeLine({
			name: lines[i],
			order: 10,
			precision: 1,
			group: 'mycanvas_base',
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0
		});
	}

	scrawl.makeWheel({
		name: 'topLeft',
		order: 20,
		startX: 50,
		startY: 50,
		fillStyle: 'blue',
		group: 'wheelGroup',
		radius: 8
	}).clone({
		name: 'topRight',
		fillStyle: 'red',
		startX: 550,
		startY: 50
	}).clone({
		name: 'bottomRight',
		startX: 550,
		startY: 550
	}).clone({
		name: 'bottomLeft',
		startX: 50,
		startY: 550
	});
	topLeft = scrawl.entity.topLeft;
	topRight = scrawl.entity.topRight;
	bottomLeft = scrawl.entity.bottomLeft;
	bottomRight = scrawl.entity.bottomRight;

	scrawl.point.top_p1.setToFixed('topLeft');
	scrawl.point.top_p2.setToFixed('topRight');
	scrawl.point.bottom_p1.setToFixed('bottomLeft');
	scrawl.point.bottom_p2.setToFixed('bottomRight');
	scrawl.point.left_p1.setToFixed('topLeft');
	scrawl.point.left_p2.setToFixed('bottomLeft');
	scrawl.point.right_p1.setToFixed('topRight');
	scrawl.point.right_p2.setToFixed('bottomRight');

	// perspective functions
	getCorners = function() {
		c = {
			tlx: topLeft.start.x,
			tly: topLeft.start.y,
			trx: topRight.start.x,
			try: topRight.start.y,
			brx: bottomRight.start.x,
			bry: bottomRight.start.y,
			blx: bottomLeft.start.x,
			bly: bottomLeft.start.y
		};
		a = Object.keys(c).map(function(key) {
			return c[key];
		});

		resizeEasel();
		paint();
		removeInterferencePatterns();
	};

	resizeEasel = function() {
		var myX = [c.tlx, c.trx, c.brx, c.blx],
			myY = [c.tly, c.try, c.bry, c.bly],
			minX = Math.min.apply(Math, myX),
			minY = Math.min.apply(Math, myY),
			maxX = Math.max.apply(Math, myX),
			maxY = Math.max.apply(Math, myY);

		drawLength = Math.ceil(Math.max.apply(Math, [
			getLength(c.tlx, c.tly, c.trx, c.try),
			getLength(c.blx, c.bly, c.brx, c.bry),
			getLength(c.tlx, c.tly, c.blx, c.bly),
			getLength(c.trx, c.try, c.brx, c.bry)
			]));

		resultX = minX;
		resultY = minY;
		easelWidth = maxX - minX;
		easelHeight = maxY - minY;

		source.set({
			width: drawLength,
			height: drawLength
		}).compile();

		easel.set({
			width: easelWidth,
			height: easelHeight
		});

		sourceImage.set({
			pasteWidth: drawLength,
			pasteHeight: drawLength
		});

		resultImage.set({
			width: easelWidth,
			height: easelHeight,
			pasteX: resultX,
			pasteY: resultY
		});
	};

	getPosition = function(a, b, v) {
		return ((b - a) * v) + a;
	};

	getLength = function(xa, ya, xb, yb) {
		return Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));
	};

	getAngle = function(xa, ya, xb, yb) {
		return Math.atan2(ya - yb, xa - xb);
	};

	setEasel = function(x, y, a) {
		var cos = Math.cos(a),
			sin = Math.sin(a);
		easelCtx.setTransform(-cos, -sin, sin, -cos, x, y);
	};

	resetEasel = function() {
		easelCtx.setTransform(1, 0, 0, 1, 0, 0);
	};

	paint = function() {
		var i, iz,
			sx, sy, ex, ey,
			len, angle, val;

		for (i = 0; i <= drawLength; i++) {
			val = i / drawLength;
			sx = getPosition(c.tlx, c.blx, val) - resultX;
			sy = getPosition(c.tly, c.bly, val) - resultY;
			ex = getPosition(c.trx, c.brx, val) - resultX;
			ey = getPosition(c.try, c.bry, val) - resultY;
			len = getLength(sx, sy, ex, ey);
			angle = getAngle(sx, sy, ex, ey);

			setEasel(sx, sy, angle);
			easelCtx.drawImage(sourceCanvas, 0, i, drawLength, 1, 0, 0, len, 1);
			resetEasel();
		}
	};

	removeInterferencePatterns = function() {
		var w = easelWidth,
			h = easelHeight;

		for (i = 0; i < 2; i++) {
			w = Math.ceil(w * 1.03);
			h = Math.ceil(h * 1.03);

			source.set({
				width: w,
				height: h
			});

			sourceCtx.drawImage(easelCanvas, 0, 0, easelWidth, easelHeight, 0, 0, w, h);
			easelCtx.drawImage(sourceCanvas, 0, 0, w, h, 0, 0, easelWidth, easelHeight);
		}
	};

	// display/control event listeners
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	getWheel = function(e) {
		var here = scrawl.pad.mycanvas.getMouse();
		stopE(e);
		myEntity = wheelGroup.getEntityAt(here);
		if (myEntity) {
			myEntity.pickupEntity(here);
			resizing = true;
		}
	};
	dropWheel = function(e) {
		stopE(e);
		if (myEntity) {
			myEntity.dropEntity();
			myEntity = false;
			resizing = false;
		}
	};
	scrawl.addListener('down', getWheel, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], dropWheel, scrawl.canvas.mycanvas);

	// animation loop
	scrawl.makeAnimation({
		fn: function() {

			if (resizing) {
				getCorners();
			}

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '; ' + '[' + a.join(', ') + ']';
			//hide-end
		},
	});

};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'path', 'wheel', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
