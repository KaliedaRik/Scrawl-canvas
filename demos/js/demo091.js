var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define gradient
	var myRad = scrawl.newRadialGradient({
		name: 'gradient',
		endX: 200,
		endY: 200,
		endRadius: 300,
		startX: 60,
		startY: 60,
		startRadius: 1,
		shift: 0.0012,
		autoUpdate: true,
		color: [{
			color: 'black',
			stop: 0
        }, {
			color: 'green',
			stop: 0.05
        }, {
			color: 'black',
			stop: 0.1
        }, {
			color: 'blue',
			stop: 0.15
        }, {
			color: 'black',
			stop: 0.2
        }, {
			color: 'purple',
			stop: 0.25
        }, {
			color: 'black',
			stop: 0.3
        }, {
			color: 'red',
			stop: 0.35
        }, {
			color: 'black',
			stop: 0.4
        }, {
			color: 'pink',
			stop: 0.45
        }, {
			color: 'black',
			stop: 0.5
        }, {
			color: 'white',
			stop: 0.55
        }, {
			color: 'black',
			stop: 0.6
        }, {
			color: 'silver',
			stop: 0.65
        }, {
			color: 'black',
			stop: 0.7
        }, {
			color: 'orange',
			stop: 0.75
        }, {
			color: 'black',
			stop: 0.8
        }, {
			color: 'gold',
			stop: 0.85
        }, {
			color: 'black',
			stop: 0.9
        }, {
			color: 'yellow',
			stop: 0.95
        }, {
			color: 'black',
			stop: 1
        }, ],
	});

	//define entitys
	scrawl.newBlock({
		name: 'b',
		width: 400,
		height: 400,
		method: 'fill',
		fillStyle: 'gradient',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
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
	modules: ['block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
