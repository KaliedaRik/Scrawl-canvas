var mycode = function() {
	'use strict';

	//define variables
	var pad = scrawl.pad.mycanvas,
		ctx = scrawl.context[pad.base],
		ticker = Date.now(),
		dTime = 0,
		sTime = 0,
		maxTime = 20,
		now,
		// rows = 20,
		// cols = 20,
		// holeW = 10,
		// holeH = 10,
		rows = 15,
		cols = 15,
		holeW = 15,
		holeH = 15,
		spring = 1000,
		damper = 10,
		windXMax = 12,
		windXMin = -1,
		windXDelta = 0.01,
		windYMax = -0.6,
		windYMin = -0.15,
		windYDelta = -0.003,
		calculatePositions,
		updateWind,
		drawNet,
		msg1 = document.getElementById('msg1'),
		msg2 = document.getElementById('msg2'),
		msg3 = document.getElementById('msg3'),
		i, j;

	//define physics - forces
	scrawl.physics.windSpeedX = 3;
	scrawl.physics.windSpeedY = -0.2;
	scrawl.makeForce({
		name: 'wind',
		fn: function(ball) {
			// constant = 0.5 * 1.23 [default airDensity] * 6.428 [half surface area of 1m radius sphere] * 0.42 [default drag]
			var constant = 1.6603524,
				wx = scrawl.physics.windSpeedX,
				wy = scrawl.physics.windSpeedY,
				wind = scrawl.v.set({ //generic work vector
					x: constant * wx * wx,
					y: constant * wy * wy,
				});
			ball.load.vectorAdd(wind);
		},
	});

	//define physics - particles
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			scrawl.makeParticle({
				name: 'b_' + i + '_' + j,
				startX: 200.5 + (i * holeW),
				startY: 150.5 + (j * holeH),
				mass: 2,
				radius: 1,
			}).addForce('gravity').addForce('wind');
		}
	}

	scrawl.entity.b_0_0.set({
		mobile: false,
	});
	scrawl.entity['b_0_' + (cols - 1)].set({
		mobile: false,
	});

	//define physics - springs
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			if (i < (rows - 1)) {
				scrawl.entity['b_' + i + '_' + j].addSpring({
					name: 's_' + i + '_' + j + '_across',
					end: 'b_' + (i + 1) + '_' + j,
					springConstant: spring,
					damperConstant: damper,
				});
			}
			if (j < (cols - 1)) {
				scrawl.entity['b_' + i + '_' + j].addSpring({
					name: 's_' + i + '_' + j + '_down',
					end: 'b_' + i + '_' + (j + 1),
					springConstant: spring,
					damperConstant: damper,
				});
			}
		}
	}

	//physics update functions
	calculatePositions = function() {
		now = Date.now();
		sTime = now - ticker;
		ticker = now;
		dTime = (sTime > maxTime) ? maxTime : sTime;
		scrawl.physics.deltaTime = dTime / 1000;
		scrawl.updateSprings();
	};

	updateWind = function() {
		var ws = scrawl.physics.windSpeedX + windXDelta;
		if (ws > windXMax || ws < windXMin) {
			windXDelta = -windXDelta;
		}
		ws = scrawl.physics.windSpeedY + windYDelta;
		if (ws > windYMax || ws < windYMin) {
			windYDelta = -windYDelta;
		}
		scrawl.physics.windSpeedX += windXDelta;
		scrawl.physics.windSpeedY += windYDelta;
	};

	//drawing function
	drawNet = function() {
		var mySpring,
			pt1,
			pt2,
			k, kz;
		pad.clear();
		pad.compile(); //particle positioning is computed as part of the compile() process
		ctx.beginPath();
		for (k = 0, kz = scrawl.springnames.length; k < kz; k++) {
			mySpring = scrawl.spring[scrawl.springnames[k]];
			pt1 = scrawl.entity[mySpring.start].place;
			pt2 = scrawl.entity[mySpring.end].place;
			ctx.moveTo(pt1.x, pt1.y);
			ctx.lineTo(pt2.x, pt2.y);
		}
		ctx.stroke();
		pad.show();
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			updateWind();
			calculatePositions();
			drawNet();

			msg1.innerHTML = 'Milliseconds per physics refresh: ' + Math.ceil(dTime);
			msg2.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(sTime);
			msg3.innerHTML = 'Frames per second: ' + Math.floor(1000 / sTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['physics', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
