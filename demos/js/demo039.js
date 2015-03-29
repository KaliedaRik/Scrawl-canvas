var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define designs (gradients)
	scrawl.makeGradient({
		name: 'mylinear',
		startX: -100,
		startY: -100,
		endX: 850,
		endY: 475,
		color: [{
			color: 'rgba(127,127,255,0.6)',
			stop: 0
        }, {
			color: '#aaffff',
			stop: 0.05
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.1
        }, {
			color: '#aaffff',
			stop: 0.15
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.2
        }, {
			color: '#aaffff',
			stop: 0.25
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.3
        }, {
			color: '#aaffff',
			stop: 0.35
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.4
        }, {
			color: '#aaffff',
			stop: 0.45
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.5
        }, {
			color: '#aaffff',
			stop: 0.55
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.6
        }, {
			color: '#aaffff',
			stop: 0.65
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.7
        }, {
			color: '#aaffff',
			stop: 0.75
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.8
        }, {
			color: '#aaffff',
			stop: 0.85
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.9
        }, {
			color: '#aaffff',
			stop: 0.95
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.9999
        }, ],
	});

	scrawl.makeRadialGradient({
		name: 'myradial',
		startX: 375,
		startY: 230,
		startRadius: 1,
		endX: 375,
		endY: 230,
		endRadius: 500,
		color: [{
			color: 'black',
			stop: 0
        }, {
			color: 'blue',
			stop: 0.1
        }, {
			color: 'black',
			stop: 0.2
        }, {
			color: 'pink',
			stop: 0.3
        }, {
			color: 'black',
			stop: 0.4
        }, {
			color: 'orange',
			stop: 0.5
        }, {
			color: 'black',
			stop: 0.6
        }, {
			color: 'yellow',
			stop: 0.7
        }, {
			color: 'black',
			stop: 0.8
        }, {
			color: 'green',
			stop: 0.9
        }, {
			color: 'black',
			stop: 0.9999
        }, ],
	});

	//define entitys
	scrawl.makeBlock({
		startX: 10,
		startY: 10,
		width: 730,
		height: 168,
		strokeStyle: 'myradial',
		fillStyle: 'mylinear',
		lineWidth: 10,
		lineJoin: 'round',
		method: 'fillDraw',
	}).clone({
		startY: 195,
		strokeStyle: 'mylinear',
		fillStyle: 'myradial',
	});

	//display canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'block',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
