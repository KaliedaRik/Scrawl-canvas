var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var video,
		picture;

	//import video into library
	scrawl.getVideoById('myvideo');
	video = scrawl.asset.myvideo;
	// video.width = 600;
	// video.height = 450;
	// video.videoWidth = 600;
	// video.videoHeight = 450;
	// video.clientWidth = 600;
	// video.clientHeight = 450;
	// video.loop = true;
	video.play();

	scrawl.newMatrixFilter({
		name: 'myfilter',
		data: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
	});

	//build entity
	picture = scrawl.newPicture({
		method: 'fill',
		pasteWidth: '80%',
		pasteHeight: '80%',
		pasteX: 'center',
		pasteY: 'center',
		copyWidth: '100%',
		copyHeight: '100%',
		handleX: 'center',
		handleY: 'center',
		copyY: 0,
		source: 'myvideo',
		//filters: ['myfilter'],
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {

			picture.setDelta({
				roll: 0.2,
			});
			scrawl.render();
			// console.log('ready state: ', video.readyState);

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
	modules: ['images', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
