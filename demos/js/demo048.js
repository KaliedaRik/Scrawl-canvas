var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		here,
		myScale,
		myWheel;

	//setup canvas
	scrawl.canvas.mycanvas.style.cursor = 'crosshair';

	//define entity
	scrawl.makeGradient({
		name: 'gradient',
		shift: 0.002,
		autoUpdate: true,
		lockTo: true,
		color: [{
			color: '#333333',
			stop: 0
        }, {
			color: 'orange',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'green',
			stop: 0.6
        }, {
			color: '#cccccc',
			stop: 0.8
        }, {
			color: '#333333',
			stop: 1
        }, ],
	});

	myWheel = scrawl.makeWheel({
		strokeStyle: 'Red',
		fillStyle: 'gradient',
		radius: 50,
		lineWidth: 4,
		pivot: 'mouse',
		method: 'fillDraw',
	});

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				myScale = (50 - Math.floor(((Math.abs(here.y - 187.5) / 187.5) * 24) + ((Math.abs(here.x - 375) / 375) * 24))) / 25;
			}
			myWheel.set({
				scale: myScale,
				visibility: (here.active) ? true : false,
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
	modules: ['animation', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
