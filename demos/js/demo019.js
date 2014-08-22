var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//load spritesheet into scrawl library
	scrawl.getImagesByClass('demo019');

	//define AnimSheet object
	scrawl.newAnimSheet({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: 1.2,
		frames: [{
			x: 0,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, ],
	});

	//define Picture sprite which will display animation
	scrawl.newPicture({
		width: 400,
		height: 200,
		method: 'fill',
		source: 'runningcat',
		animSheet: 'animatedCat',
	});

	//animation object
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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
