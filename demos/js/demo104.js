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

	scrawl.makeMultiFilter({
		name: 'sepia',
		filters: scrawl.makeFilter({
			multiFilter: 'sepia', 
			species: 'sepia'
		})
	});

	//build entity
	scrawl.makePattern({
		name: 'p1',
		source: 'warning',
	}).clone({
		name: 'p2',
		source: 'leaves',
	});
	myEntity = scrawl.makeWheel({
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
		multiFilter: 'sepia',
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
	extensions: ['wheel', 'images', 'multifilters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
