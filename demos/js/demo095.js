var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//add a canvas to the web page
	scrawl.addCanvasToPage({
		name: 'canvas',
		parentElement: 'canvashost',
		width: 400,
		height: 200,
	}).makeCurrent();

	//define designs (gradients)
	scrawl.newGradient({
		name: 'grad_1',
		setToEntity: true,
		startX: '-50%',
		endX: '150%',
		startY: '0%',
		endY: '0%',
		shift: 0.002,
		autoUpdate: true,
		color: [{
			color: 'rgba(0,0,0,0)',
			stop: 0
        }, {
			color: 'rgba(0,0,0,0)',
			stop: 0.1
        }, {
			color: 'rgba(0,0,0,1)',
			stop: 0.3
        }, {
			color: 'rgba(0,0,0,1)',
			stop: 0.7
        }, {
			color: 'rgba(0,0,0,0)',
			stop: 0.9
        }, {
			color: 'rgba(0,0,0,0)',
			stop: 0.999999
        }, ],
	}).clone({
		name: 'grad_2',
		setToEntity: false,
		startX: -100,
		startY: 0,
		endX: 500,
		endY: 0,
		shift: -0.01,
		color: [{
			color: 'rgb(200,0,0)',
			stop: 0
        }, {
			color: 'rgb(200,0,0)',
			stop: 0.2
        }, {
			color: 'rgb(0,128,0)',
			stop: 0.4
        }, {
			color: 'rgb(0,0,200)',
			stop: 0.6
        }, {
			color: 'rgb(0,128,0)',
			stop: 0.8
        }, {
			color: 'rgb(200,0,0)',
			stop: 0.999999
        }, ],
	});

	//define entitys
	scrawl.newPhrase({
		name: 'filter',
		text: 'Look what\nScrawl.js\ncan do!',
		textAlign: 'center',
		startX: 200,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		size: 40,
		method: 'fill',
		fillStyle: 'grad_1',
		weight: 900,
	}).clone({
		name: 'text',
		order: 1,
		globalCompositeOperation: 'source-atop',
		fillStyle: 'grad_2',
		method: 'fillDraw',
		lineWidth: 2,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.pad.canvas.render();

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
	modules: ['phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
