var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var width,
		height,
		widthVal = 20,
		heightVal = 20,
		getWidth,
		getHeight,
		updateInput;

	//import image
	scrawl.getImagesByClass('demo409');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'pixelateparrot',
	}).filter('pixelate', {
		width: 20,
		height: 20,
		useSourceData: true,
	});

	//define entitys
	scrawl.newPicture({
		name: 'parrot',
		startX: 10,
		startY: 10,
		scale: 0.5,
		source: 'parrot',
	}).clone({
		startX: 120,
		startY: 210,
		source: 'pixelateparrot',
	});

	//preparing the DOM input elements
	width = document.getElementById('width');
	width.value = 20;
	height = document.getElementById('height');
	height.value = 20;

	//image update function
	updateInput = function() {
		scrawl.image.pixelateparrot.filter('pixelate', {
			width: widthVal,
			height: heightVal,
			useSourceData: true,
		});
	};

	//event listeners
	getWidth = function(e) {
		widthVal = parseFloat(width.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	width.addEventListener('change', getWidth, false);
	getHeight = function(e) {
		heightVal = parseFloat(height.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	height.addEventListener('change', getHeight, false);

	//to make sure everything is in place ...
	updateInput();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '<br />width: ' + widthVal + '; height: ' + heightVal;
			//hide-end
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
