var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myEntity;

	//import images; setup variables
	scrawl.getImagesByClass('demo104');

	scrawl.newSepiaFilter({
		name: 'sepia',
	});

	//build entity
	scrawl.newPattern({
		name: 'p1',
		source: 'warning',
	}).clone({
		name: 'p2',
		source: 'leaves',
	});
	myEntity = scrawl.newWheel({
		name: 'mainWheel',
		startX: 100,
		startY: 100,
		radius: 60,
		strokeStyle: 'p1',
		fillStyle: 'p2',
		lineWidth: 10,
		method: 'fillDraw',
	});
	myEntity.convertToPicture({
		name: 'pictureWheel',
		startX: 300,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		filters: ['sepia'],
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['wheel', 'images', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
