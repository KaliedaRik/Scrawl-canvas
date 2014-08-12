var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define Shape sprite
	scrawl.makePath({
		name: 'track',
		data: 'm-150-150 100,0 100,100 100,0 0,-50 -50,-50 -150,100 -100,0',
		lineWidth: 10,
		handleX: 'center',
		handleY: 'center',
		isLine: false,
		startX: 200,
		startY: 200,
		markStart: 'circle',
		markEnd: 'arrow',
		mark: 'diamond',
		precision: 1,
	});

	//define mark sprites
	scrawl.newWheel({
		name: 'circle',
		visibility: false,
		fillStyle: 'red',
		strokeStyle: 'blue',
		method: 'fillDraw',
		radius: 15,
	});
	scrawl.newBlock({
		name: 'diamond',
		visibility: false,
		width: 20,
		height: 20,
		handleX: 'center',
		handleY: 'center',
		roll: 45,
		fillStyle: 'gold',
		strokeStyle: 'blue',
		method: 'fillDraw',
		lineWidth: 2,
		globalAlpha: 0.8,
	});
	scrawl.newShape({
		name: 'arrow',
		visibility: false,
		data: 'l0,0 40,15 -40,15 0-30z',
		handleX: 'left',
		handleY: 'center',
		method: 'fill',
		addPathRoll: true,
	});

	//display canvas
	scrawl.render();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'path', 'shape'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
