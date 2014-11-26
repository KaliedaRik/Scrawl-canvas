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
	scrawl.getVideoById('myvideo');
	video = scrawl.video.myvideo;
	if (video.api.readyState > 1) {
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

	//define filters
	scrawl.newGreyscaleFilter({
		name: 'myGreyscale',
		filterStrength: 0.9,
	});
	scrawl.newInvertFilter({
		name: 'myInvert',
	});
	scrawl.newBrightnessFilter({
		name: 'myBrightness',
		brightness: 0.4,
	});
	scrawl.newSaturationFilter({
		name: 'mySaturation',
		saturation: 0.4,
	});
	scrawl.newThresholdFilter({
		name: 'myThreshold',
		filterStrength: 0.8,
		threshold: 0.6,
	});
	scrawl.newChannelsFilter({
		name: 'myChannels',
		red: 1.3,
		green: '120%',
		blue: 0,
	});
	scrawl.newChannelStepFilter({
		name: 'myChannelStep',
		red: 64,
		green: 64,
		blue: 64,
	});
	scrawl.newTintFilter({
		name: 'myTint',
		greenInGreen: 0,
		blueInGreen: 1,
	});
	scrawl.newSepiaFilter({
		name: 'mySepia',
	});
	scrawl.newMatrixFilter({
		name: 'myMatrix',
		data: [-2, -1, 0, -1, 0, 1, 0, 1, 2],
	});
	scrawl.newSharpenFilter({
		name: 'mySharpen',
	});
	scrawl.newPixelateFilter({
		name: 'myPixelate',
		width: 8,
		height: 8,
	});
	scrawl.newBlurFilter({
		name: 'myBlur',
		radiusX: 12,
		radiusY: 4,
		roll: 45,
		includeInvisiblePoints: true,
	});
	scrawl.newLeachFilter({
		name: 'myLeach',
		minRed: 180,
		minBlue: 180,
		minGreen: 180,
	});
	scrawl.newSeparateFilter({
		name: 'mySeparate',
		channel: 'yellow',
	});
	scrawl.newNoiseFilter({
		name: 'myNoise',
		radiusX: 12,
		radiusY: 4,
		roll: 45,
		noise: 1,
	});

	current_filter = 'myGreyscale';
	input_filter.value = 'myGreyscale';

	//build entitys
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
	scrawl.newAnimation({
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation', 'wheel', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
