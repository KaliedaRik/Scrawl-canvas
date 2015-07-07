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
		wheel,

		current_filter,
		input_filter = document.getElementById('filter'),
		event_filter,

		stopE;

	//import video into library
	// scrawl.getVideoById('myvideo');
	// video = scrawl.video.myvideo;
	// if (video.api.readyState > 1) {
	// 	video.api.loop = true;
	// 	video.api.muted = true;
	// 	video.api.play();
	// }
	// else {
	// 	video.api.addEventListener('canplay', function() {
	// 		video.api.loop = true;
	// 		video.api.muted = true;
	// 		video.api.play();
	// 	}, false);
	// }

	scrawl.makeVideo({
		element: document.getElementById('myvideo'),
		readyState: 3,
		callback: function() {
			video = scrawl.video.myvideo;
			video.api.loop = true;
			video.api.muted = true;
			video.api.play();
			// scrawl.design.mypattern.set({
			// 	source: 'myvideo'
			// });
			// picture.set({
			// 	source: 'myvideo'
			// });
		}
	});

	scrawl.makePattern({
		name: 'mypattern',
		source: 'myvideo',
	});

	//define filters
	scrawl.makeGreyscaleFilter({
		name: 'myGreyscale',
		filterStrength: 0.9,
	});
	scrawl.makeInvertFilter({
		name: 'myInvert',
	});
	scrawl.makeBrightnessFilter({
		name: 'myBrightness',
		brightness: 0.4,
	});
	scrawl.makeSaturationFilter({
		name: 'mySaturation',
		saturation: 0.4,
	});
	scrawl.makeThresholdFilter({
		name: 'myThreshold',
		filterStrength: 0.8,
		threshold: 0.6,
	});
	scrawl.makeChannelsFilter({
		name: 'myChannels',
		red: 1.3,
		green: '120%',
		blue: 0,
	});
	scrawl.makeChannelStepFilter({
		name: 'myChannelStep',
		red: 64,
		green: 64,
		blue: 64,
	});
	scrawl.makeTintFilter({
		name: 'myTint',
		greenInGreen: 0,
		blueInGreen: 1,
	});
	scrawl.makeSepiaFilter({
		name: 'mySepia',
	});
	scrawl.makeMatrixFilter({
		name: 'myMatrix',
		data: [-2, -1, 0, -1, 0, 1, 0, 1, 2],
	});
	scrawl.makeSharpenFilter({
		name: 'mySharpen',
	});
	scrawl.makePixelateFilter({
		name: 'myPixelate',
		width: 8,
		height: 8,
	});
	scrawl.makeBlurFilter({
		name: 'myBlur',
		radiusX: 10,
		radiusY: 10,
		skip: 10,
	});
	scrawl.makeLeachFilter({
		name: 'myLeach',
		exclude: [[120, 120, 120, 255, 255, 255]]
	});
	scrawl.makeSeparateFilter({
		name: 'mySeparate',
		channel: 'yellow',
	});
	scrawl.makeNoiseFilter({
		name: 'myNoise',
		radiusX: 12,
		radiusY: 4,
		roll: 45,
		noise: 1,
	});

	current_filter = 'myGreyscale';
	input_filter.value = 'myGreyscale';

	//build entitys
	picture = scrawl.makePicture({
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

	wheel = scrawl.makeWheel({
		radius: 140,
		startX: 220,
		startY: -50,
		method: 'fill',
		handleX: -260,
		handleY: -230,
		fillStyle: 'mypattern',
		filters: [current_filter],
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_filter = function(e) {
		stopE(e);
		current_filter = input_filter.value;
		wheel.set({
			filters: [current_filter],
		});
	};
	input_filter.addEventListener('change', event_filter, false);

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			picture.setDelta({
				roll: 0.2,
			});
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'animation', 'wheel', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
