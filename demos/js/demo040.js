var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//import images for patterns
	scrawl.getImagesByClass('demo040');

	//define patterns
	scrawl.newPattern({ //uses preloaded images
		name: 'leaves',
		source: 'leaves',
	}).clone({
		name: 'water',
		source: 'water',
	});
	scrawl.newPattern({ //loads images dynamically before using them
		name: 'marble',
		url: 'img/marble.png',
		callback: function() {
			scrawl.render();
		},
	}).clone({
		name: 'parque',
		url: 'img/parque.png',
	});

	//define entitys
	scrawl.newBlock({
		name: 'b1',
		startX: 35,
		startY: 10,
		width: 300,
		height: 150,
		fillStyle: 'leaves',
		strokeStyle: 'marble',
		lineWidth: 12,
		lineJoin: 'round',
		shadowOffsetX: 8,
		shadowOffsetY: 8,
		shadowBlur: 5,
		shadowColor: 'Black',
		method: 'sinkInto',
	}).clone({
		name: 'b2',
		fillStyle: 'marble',
		strokeStyle: 'water',
		startX: 375,
	}).clone({
		name: 'b3',
		fillStyle: 'water',
		strokeStyle: 'parque',
		startY: 200,
	}).clone({
		name: 'b4',
		fillStyle: 'parque',
		strokeStyle: 'leaves',
		startX: 35,
	});

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
	modules: ['block', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
