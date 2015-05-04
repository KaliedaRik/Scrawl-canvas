var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var myEntity,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		result,
		myRoll = -0.7,
		moveEntitys;

	//bouncing block
	myEntity = scrawl.makeBlock({
		name: 'myblock',
		startX: 375,
		startY: 187,
		deltaX: -3,
		deltaY: 2,
		width: 100,
		height: 100,
		handleX: 'center',
		handleY: 'center',
		strokeStyle: 'Purple',
		fillStyle: 'Pink',
		lineWidth: 10,
		lineJoin: 'round',
		method: 'sinkInto',
		shadowOffsetX: 5,
		shadowOffsetY: 5,
		shadowBlur: 5,
		shadowColor: 'black',
		collisionPoints: 'corners',
	});

	//pin to mark start/rotate/reflect point on bouncing block
	scrawl.makeWheel({
		pivot: 'myblock',
		radius: 4,
		fillStyle: 'blue',
		method: 'fill',
		order: 1,
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 2,
		shadowColor: 'black',
	});

	//block used for building cell field image
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
		myEntity.updateStart();
		result = myEntity.checkField();
		if (typeof result !== 'boolean') {
			if (!scrawl.isBetween(result.x, minX, maxX, true)) {
				myEntity.reverse('deltaX');
			}
			if (!scrawl.isBetween(result.y, minY, maxY, true)) {
				myEntity.reverse('deltaY');
			}
			myEntity.setDelta({
				scale: -0.08
			});
		}
		myEntity.setDelta({
			roll: myRoll,
			scale: (myEntity.scale < 1) ? 0.005 : 0,
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
	extensions: ['block', 'wheel', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
