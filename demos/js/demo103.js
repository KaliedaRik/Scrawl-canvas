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

	myGroup = scrawl.makeGroup({
		name: 'mygroup',
	});

	scrawl.makeGreyscaleFilter({
		name: 'gscale',
	});

	//build entity
	scrawl.makePattern({
		name: 'p1',
		source: 'warning',
	}).clone({
		name: 'p2',
		source: 'leaves',
	});
	scrawl.makeWheel({
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
	scrawl.makeWheel({
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

	myGroup.convertGroupToPicture({
		startX: 300,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		filters: ['gscale'],
		roll: 70,
		method: 'fillDraw',
		lineWidth: 2,
		callback: function() {
			scrawl.render();
		},
	});

	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['wheel', 'images', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
