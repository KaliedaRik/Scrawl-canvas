var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var rawMatrix = "-1, -1, -1, -1, 8, -1, -1, -1, -1",
		matrix = [-1, -1, -1, -1, 8, -1, -1, -1, -1],
		getMatrix,
		input,
		updateInput;

	//import image
	scrawl.getImagesByClass('demo410');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'matrixparrot',
	}).filter('matrix', {
		data: matrix,
		wrap: true,
		useSourceData: true,
	});

	//define sprites
	scrawl.newPicture({
		name: 'parrot',
		startX: 10,
		startY: 10,
		scale: 0.5,
		source: 'parrot',
	}).clone({
		startX: 120,
		startY: 210,
		source: 'matrixparrot',
	});

	//preparing the DOM input elements
	input = document.getElementById('matrix');
	input.value = rawMatrix;

	//image update function
	updateInput = function() {
		scrawl.image.matrixparrot.filter('matrix', {
			data: matrix,
			useSourceData: true,
			wrap: true,
		});
	};

	//event listeners
	getMatrix = function(e) {
		rawMatrix = input.value;
		matrix = rawMatrix.split(',');
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	input.addEventListener('change', getMatrix, false);

	//to make sure everything is in place ...
	updateInput();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
