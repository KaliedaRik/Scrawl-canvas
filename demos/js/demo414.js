var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var width,
		height,
		outerWidth,
		outerHeight,
		widthVal = 50,
		heightVal = 50,
		outerWidthVal = 80,
		outerHeightVal = 80,
		getWidth,
		getHeight,
		getOuterWidth,
		getOuterHeight,
		updateInput;

	//import image
	scrawl.getImagesByClass('demo414');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'glasstileparrot',
	}).filter('glassTile', {
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
		source: 'glasstileparrot',
	});

	//preparing the DOM input elements
	width = document.getElementById('width');
	width.value = 50;
	height = document.getElementById('height');
	height.value = 50;
	outerWidth = document.getElementById('outerwidth');
	outerWidth.value = 80;
	outerHeight = document.getElementById('outerheight');
	outerHeight.value = 80;

	//image update function
	updateInput = function() {
		scrawl.image.glasstileparrot.filter('glassTile', {
			width: widthVal,
			height: heightVal,
			outerWidth: outerWidthVal,
			outerHeight: outerHeightVal,
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
	getOuterWidth = function(e) {
		outerWidthVal = parseFloat(outerWidth.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	outerWidth.addEventListener('change', getOuterWidth, false);
	getOuterHeight = function(e) {
		outerHeightVal = parseFloat(outerHeight.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	outerHeight.addEventListener('change', getOuterHeight, false);

	//to make sure everything is in place ...
	updateInput();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '<br />width: ' + widthVal + '; height: ' + heightVal + '; outer width: ' + outerWidthVal + '; outer height: ' + outerHeightVal;
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
