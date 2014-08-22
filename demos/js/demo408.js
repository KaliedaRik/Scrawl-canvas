var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var radius,
		radiusX,
		radiusY,
		roll,
		radX = 5,
		radY = 5,
		rollVal = 0,
		updateInput,
		getRadius,
		getRadiusX,
		getRadiusY,
		getRoll;

	//import image
	scrawl.getImagesByClass('demo408');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'blurparrot',
	}).filter('blur', {
		radius: 5,
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
		source: 'blurparrot',
	});

	//preparing the DOM input elements
	radius = document.getElementById('radius');
	radius.value = 5;
	radiusX = document.getElementById('radiusx');
	radiusX.value = 5;
	radiusY = document.getElementById('radiusy');
	radiusY.value = 5;
	roll = document.getElementById('roll');
	roll.value = 0;

	//image update function
	updateInput = function() {
		scrawl.image.blurparrot.filter('blur', {
			radiusX: radX,
			radiusY: radY,
			roll: rollVal,
			useSourceData: true,
		});
	};

	//event listeners
	getRadius = function(e) {
		radX = parseFloat(radius.value);
		radiusX.value = radX;
		radY = parseFloat(radius.value);
		radiusY.value = radY;
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	radius.addEventListener('change', getRadius, false);
	getRadiusX = function(e) {
		radX = parseFloat(radiusX.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	radiusX.addEventListener('change', getRadiusX, false);
	getRadiusY = function(e) {
		radY = parseFloat(radiusY.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	radiusY.addEventListener('change', getRadiusY, false);
	getRoll = function(e) {
		rollVal = parseFloat(roll.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	roll.addEventListener('change', getRoll, false);

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
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '<br />radius x: ' + radX + '; radius y: ' + radY + '; roll: ' + rollVal;
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
