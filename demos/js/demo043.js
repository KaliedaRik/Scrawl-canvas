var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var result,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		myEntity,
		points = ['frame_p2', 'frame_p4', 'frame_p6', 'frame_p8', 'frame_p10'],
		dRadius = 2,
		minRad = 20,
		maxRad = 80,
		radius = 50,
		dRoll = -1,
		moveEntitys;

	//define entitys
	myEntity = scrawl.makeRegularShape({
		name: 'frame',
		startX: 562,
		startY: 187,
		deltaX: 3,
		deltaY: -2,
		method: 'none',
		radius: 50,
		sides: 10,
		collisionPoints: 'start',
	});

	for (var i = 1; i < 11; i++) {
		scrawl.makeWheel({
			pivot: 'frame_p' + i,
			radius: 12,
			fillStyle: 'Green',
			method: 'fillDraw',
		});
	}

	scrawl.makeWheel({
		pivot: 'frame',
		radius: 4,
		fillStyle: 'red',
		method: 'fill',
	});

	//entity used to build Cell collision zone image
	scrawl.makeBlock({
		startX: 50,
		startY: 50,
		width: 650,
		height: 275,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.buildFields();

	//animation function
	moveEntitys = function() {
		result = myEntity.checkField();
		if (typeof result !== 'boolean') {
			if (!scrawl.isBetween(result.x, minX, maxX, true)) {
				myEntity.reverse('deltaX');
			}
			if (!scrawl.isBetween(result.y, minY, maxY, true)) {
				myEntity.reverse('deltaY');
			}
		}
		myEntity.updateStart();
		if (!scrawl.isBetween((radius + dRadius), maxRad, minRad)) {
			dRadius = -dRadius;
		}
		radius += dRadius;
		for (var j = 0, z = points.length; j < z; j++) {
			scrawl.point[points[j]].set({
				distance: radius,
			});
		}
		myEntity.setDelta({
			roll: dRoll,
		});
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			moveEntitys();
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'factories', 'animation', 'collisions', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
