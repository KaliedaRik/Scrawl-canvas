var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myWheel,
		maxScale = 9,
		minScale = 2,
		dScale = 0.02;

	//define designs (colors)
	scrawl.newColor({
		name: 'liner',
		random: true,
		rMin: 50,
		rMax: 220,
		gMin: 50,
		gMax: 220,
		bMin: 50,
		bMax: 220,
		a: 1,
	}).clone({
		name: 'filler',
		rBounce: true,
		rShift: 1,
		gBounce: true,
		gShift: 1,
		bBounce: true,
		bShift: 1,
		a: 1,
		autoUpdate: true,
	});

	//define sprite
	myWheel = scrawl.newWheel({
		startX: 200,
		startY: 200,
		radius: 18,
		fillStyle: 'filler',
		strokeStyle: 'liner',
		lineWidth: 4,
		lineCap: 'round',
		lineJoin: 'round',
		shadowOffsetX: 1,
		shadowOffsetY: 1,
		shadowBlur: 1,
		shadowColor: 'black',
		method: 'floatOver',
		startAngle: 30,
		endAngle: 325,
		includeCenter: true,
		scale: 5,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			if (!scrawl.isBetween((myWheel.scale + dScale), maxScale, minScale)) {
				dScale = -dScale;
			}
			myWheel.setDelta({
				scale: dScale,
				roll: 1,
			});
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
	modules: ['wheel', 'color', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
