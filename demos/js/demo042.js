var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myEntity,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		points = ['star_p2', 'star_p4', 'star_p6', 'star_p8', 'star_p10'],
		dRadius = 2,
		minRad = 20,
		maxRad = 80,
		radius = 80,
		dRoll = 1,
		result,
		moveEntitys;

	//define entitys
	myEntity = scrawl.makeRegularShape({
		name: 'star',
		startX: 210,
		startY: 187,
		deltaX: 3,
		deltaY: 2,
		lineWidth: 5,
		lineJoin: 'round',
		lineCap: 'round',
		strokeStyle: 'Red',
		fillStyle: 'Blue',
		method: 'fillDraw',
		miterLimit: 5,
		radius: 80,
		sides: 10,
		collisionPoints: 'start',
	});

	scrawl.makeWheel({
		pivot: 'star',
		radius: 4,
		fillStyle: 'gold',
		method: 'fill',
		order: 1,
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['path', 'factories', 'animation', 'collisions', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
