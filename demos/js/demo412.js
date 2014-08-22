var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var red,
		green,
		blue,
		redVal = 16,
		greenVal = 16,
		blueVal = 16,
		getRed,
		getGreen,
		getBlue,
		updateInput;

	//import image
	scrawl.getImagesByClass('demo412');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'channelstepparrot',
	}).filter('channelStep', {
		red: 16,
		green: 16,
		blue: 16,
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
		source: 'channelstepparrot',
	});

	//preparing the DOM input elements
	red = document.getElementById('red');
	red.value = 16;
	green = document.getElementById('green');
	green.value = 16;
	blue = document.getElementById('blue');
	blue.value = 16;

	//image update function
	updateInput = function() {
		scrawl.image.channelstepparrot.filter('channelStep', {
			red: redVal,
			green: greenVal,
			blue: blueVal,
			useSourceData: true,
		});
	};

	//event listeners
	getRed = function(e) {
		redVal = parseFloat(red.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	red.addEventListener('change', getRed, false);
	getGreen = function(e) {
		greenVal = parseFloat(green.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	green.addEventListener('change', getGreen, false);
	getBlue = function(e) {
		blueVal = parseFloat(blue.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	blue.addEventListener('change', getBlue, false);

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
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '<br />Red: ' + redVal + '; Green: ' + greenVal + '; Blue: ' + blueVal;
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
