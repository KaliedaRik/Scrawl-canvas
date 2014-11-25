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
		picture,
		wheel;

	//import video into library
	scrawl.getVideoById('myvideo');
	video = scrawl.video.myvideo;
	if (video.api.readyState > 2) {
		video.api.loop = true;
		video.api.muted = true;
		video.api.play();
	}
	else {
		video.api.addEventListener('canplay', function() {
			video.api.loop = true;
			video.api.muted = true;
			video.api.play();
		}, false);
	}

	scrawl.newPattern({
		name: 'mypattern',
		source: 'myvideo',
	});

	//build entity
	picture = scrawl.newPicture({
		method: 'fill',
		pasteWidth: '50%',
		pasteHeight: '50%',
		pasteX: '30%',
		pasteY: 'center',
		copyWidth: '100%',
		copyHeight: '100%',
		handleX: 'center',
		handleY: 'center',
		copyY: 0,
		source: 'myvideo',
	});

	wheel = scrawl.newWheel({
		radius: 140,
		startX: 220,
		startY: -50,
		method: 'fill',
		handleX: -260,
		handleY: -230,
		fillStyle: 'mypattern',
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
	modules: ['images', 'animation', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
