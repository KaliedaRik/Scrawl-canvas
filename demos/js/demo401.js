var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myInput,
		updateInput,
		IETimer = Date.now();

	//define sprites
	scrawl.newPicture({
		name: 'parrot',
		startX: 10,
		startY: 10,
		scale: 0.5,
		url: 'http://scrawl.rikweb.org.uk/img/carousel/cagedparrot.png',
		callback: function() {
			//clone image and add filter to it
			scrawl.image.parrot.clone({
				name: 'grayparrot',
			}).filter('grayscale', {
				useSourceData: true,
				value: 1,
			});
			this.clone({
				startX: 120,
				startY: 210,
				source: 'grayparrot',
			});
		},
	});

	//preparing the DOM input elements
	myInput = document.getElementById('myvalue');
	myInput.value = 1;

	//event listener
	updateInput = function(e) {
		if (scrawl.xt(scrawl.image.grayparrot)) {
			scrawl.image.grayparrot.filter('grayscale', {
				value: parseFloat(myInput.value),
				useSourceData: true,
			});
		}
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
	};
	myInput.addEventListener('input', updateInput, false); //for firefox real-time updating
	myInput.addEventListener('change', updateInput, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			//known bug re importing images dynamically - IE11 
			// - repeating the update after a second fixes the undisplayed grayscale image issue
			if (IETimer && IETimer + 1000 < Date.now()) {
				updateInput();
				IETimer = false;
			}
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Current grayscale value: ' + myInput.value + '. Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
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
