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
		filter,
		filterDefinitions,
		input_filter = document.getElementById('filter'),
		event_filter,

		stopE;

	//import video into library
	scrawl.makeVideo({
		element: document.getElementById('myvideo'),
		readyState: 1,
		callback: function() {
			video = scrawl.video.myvideo;
			video.api.loop = true;
			video.api.muted = true;
			video.api.play();
		}
	});

	scrawl.makePattern({
		name: 'mypattern',
		source: 'myvideo',
	});

	//define filters
	// scrawl.makeGreyscaleFilter({
	// 	name: 'myGreyscale',
	// 	filterStrength: 0.9,
	// });
	// scrawl.makeInvertFilter({
	// 	name: 'myInvert',
	// });
	// scrawl.makeBrightnessFilter({
	// 	name: 'myBrightness',
	// 	brightness: 0.4,
	// });
	// scrawl.makeSaturationFilter({
	// 	name: 'mySaturation',
	// 	saturation: 0.4,
	// });
	// scrawl.makeThresholdFilter({
	// 	name: 'myThreshold',
	// 	filterStrength: 0.8,
	// 	threshold: 0.6,
	// });
	// scrawl.makeChannelsFilter({
	// 	name: 'myChannels',
	// 	red: 1.3,
	// 	green: '120%',
	// 	blue: 0,
	// });
	// scrawl.makeChannelStepFilter({
	// 	name: 'myChannelStep',
	// 	red: 64,
	// 	green: 64,
	// 	blue: 64,
	// });
	// scrawl.makeTintFilter({
	// 	name: 'myTint',
	// 	greenInGreen: 0,
	// 	blueInGreen: 1,
	// });
	// scrawl.makeSepiaFilter({
	// 	name: 'mySepia',
	// });
	// scrawl.makeMatrixFilter({
	// 	name: 'myMatrix',
	// 	data: [-2, -1, 0, -1, 0, 1, 0, 1, 2],
	// });
	// scrawl.makeSharpenFilter({
	// 	name: 'mySharpen',
	// });
	// scrawl.makePixelateFilter({
	// 	name: 'myPixelate',
	// 	width: 8,
	// 	height: 8,
	// });
	// scrawl.makeBlurFilter({
	// 	name: 'myBlur',
	// 	radiusX: 10,
	// 	radiusY: 10,
	// 	skip: 10,
	// });
	// scrawl.makeLeachFilter({
	// 	name: 'myLeach',
	// 	exclude: [[120, 120, 120, 255, 255, 255]]
	// });
	// scrawl.makeSeparateFilter({
	// 	name: 'mySeparate',
	// 	channel: 'yellow',
	// });
	// scrawl.makeNoiseFilter({
	// 	name: 'myNoise',
	// 	radiusX: 12,
	// 	radiusY: 4,
	// 	roll: 45,
	// 	noise: 1,
	// });
	filterDefinitions = {
		grayscale: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'grayscale'
		}),
		sepia: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'sepia'
		}),
		invert: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'invert'
		}),
		red: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'red'
		}),
		green: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'green'
		}),
		blue: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'blue'
		}),
		notred: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'notred'
		}),
		notgreen: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'notgreen'
		}),
		notblue: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'notblue'
		}),
		cyan: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'cyan'
		}),
		magenta: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'magenta'
		}),
		yellow: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'yellow'
		}),
		brightness: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'brightness', 
			level: 2
		}),
		saturation: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'saturation', 
			level: 2
		}),
		threshold: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'threshold', 
			level: 127
		}),
		channels: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'channels', 
			red: 0.8, 
			green: 0.4, 
			blue: 2
		}),
		channelstep: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'channelstep', 
			red: 100, 
			green: 100, 
			blue: 100
		}),
		tint: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'tint', 
			redInRed: 1, 
			redInGreen: 0, 
			redInBlue: 0.5, 
			greenInRed: 0, 
			greenInGreen: 0.5, 
			greenInBlue: 0, 
			blueInRed: 0.5, 
			blueInGreen: 1.2, 
			blueInBlue: 1
		}),
		pixelate: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'pixelate', 
			blockWidth: 12, 
			blockHeight: 12, 
			offsetX: 0, 
			offsetY: 0
		}),
		matrix: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix', 
			blockWidth: 3, 
			blockHeight: 3, 
			offsetX: -1, 
			offsetY: -1, 
			weights: [1, 1, 0, 1, 0, -1, 0, -1, -1]
		}),
		blur: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'blur', 
			radius: 3, 
			step: 1
		}),
		chroma: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'chroma', 
			ranges: [[200, 170, 170, 255, 255, 255]]
		})
	};

	current_filter = 'grayscale';
	input_filter.value = 'grayscale';
	
	filter = scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: filterDefinitions[current_filter]
	});

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
		multiFilter: 'myFilter',
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_filter = function(e) {
		stopE(e);
		current_filter = input_filter.value;
		filter.set({
			filters: filterDefinitions[current_filter]
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
	extensions: ['images', 'animation', 'wheel', 'multifilters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
