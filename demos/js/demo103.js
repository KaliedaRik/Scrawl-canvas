var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myGroup;

	//import images; setup variables
	scrawl.getImagesByClass('demo103');

	myGroup = scrawl.newGroup({
		name: 'mygroup',
	});

	//build entity
	scrawl.newPattern({
		name: 'p1',
		image: 'warning',
	}).clone({
		name: 'p2',
		image: 'leaves',
	});
	scrawl.newWheel({
		name: 'mainWheel',
		startX: 100,
		startY: 100,
		radius: 60,
		strokeStyle: 'p1',
		fillStyle: 'p2',
		lineWidth: 10,
		method: 'fillDraw',
		roll: 45,
		group: 'mygroup',
	});
	scrawl.newWheel({
		pivot: 'mainWheel',
		handleY: 70,
		radius: 8,
		fillStyle: 'red',
		group: 'mygroup',
	}).clone({
		roll: 90,
	}).clone({
		roll: 180,
	}).clone({
		roll: 270,
	});

	myGroup.convertToEntity({
		startX: 300,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		filters: {
			grayscale: {},
		},
		roll: 70,
		method: 'fillDraw',
		lineWidth: 2,
	});

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
	modules: ['wheel', 'images', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
