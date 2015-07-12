var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//code here
	var timeline,
		subtimeline,
		seekerInput,
		seekerValue,
		readSeeker,
		writeSeeker,
		stopE;

	scrawl.makeColor({
		name: 'mycolor'
	});

	scrawl.makeBlock({
		name: 'myblock',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		width: '80%',
		height: '80%',
		lineWidth: 30,
		fillStyle: 'blue',
		strokeStyle: 'yellow',
		globalAlpha: 0,
		method: 'drawFill'
	});

	scrawl.makePhrase({
		name: 'bare_0',
		font: '18pt Arial, sans-serif',
		text: '0',
		fillStyle: 'mycolor',
		handleX: 'center',
		handleY: 'center',
		startX: '20%',
		startY: '25%'
	}).clone({
		name: 'bare_1200_5',
		text: '1200.5',
		startX: '40%'
	}).clone({
		name: 'ms_0',
		text: '0ms',
		startX: '60%'
	}).clone({
		name: 'ms_1773_975',
		text: '1773.975ms',
		startX: '80%'
	}).clone({
		name: 's_1_94',
		text: '1.94s',
		startY: '50%'
	}).clone({
		name: 's_1_first',
		text: '1s',
		startX: '60%'
	}).clone({
		name: 's_1_second',
		text: '1s',
		startX: '40%'
	}).clone({
		name: 's_0',
		text: '0s',
		startX: '20%'
	}).clone({
		name: 'percent_0',
		text: '0%',
		startY: '75%'
	}).clone({
		name: 'percent_40_5_first',
		text: '40.5%',
		startX: '40%'
	}).clone({
		name: 'percent_40_5_second',
		text: '40.5%',
		startX: '60%'
	}).clone({
		name: 'percent_100',
		text: '100%',
		startX: '80%'
	});

	scrawl.makeTween({
		name: 't_bare_0',
		targets: scrawl.entity.bare_0,
		start: {
			roll: 0
		},
		end: {
			roll: 720
		},
		engine: {
			roll: 'easeOutIn'
		},
		duration: 600
	}).clone({
		name: 't_bare_1200_5',
		targets: scrawl.entity.bare_1200_5
	}).clone({
		name: 't_ms_0',
		targets: scrawl.entity.ms_0
	}).clone({
		name: 't_ms_1773_975',
		targets: scrawl.entity.ms_1773_975
	}).clone({
		name: 't_s_1_94',
		targets: scrawl.entity.s_1_94
	}).clone({
		name: 't_s_1_first',
		targets: scrawl.entity.s_1_first
	}).clone({
		name: 't_s_1_second',
		targets: scrawl.entity.s_1_second
	}).clone({
		name: 't_s_0',
		targets: scrawl.entity.s_0
	}).clone({
		name: 't_percent_0',
		targets: 'percent_0'
	}).clone({
		name: 't_percent_40_5_first',
		targets: 'percent_40_5_first'
	}).clone({
		name: 't_percent_40_5_second',
		targets: 'percent_40_5_second'
	}).clone({
		name: 't_percent_100',
		targets: 'percent_100'
	});
	scrawl.makeTween({
		name: 't_size',
		targets: [
			scrawl.entity.bare_0,
			scrawl.entity.ms_0,
			scrawl.entity.ms_1773_975,
			scrawl.entity.s_1_second,
			'percent_100'
			],
		start: {
			scale: 1
		},
		end: {
			scale: 1.35
		},
		duration: 1500
	});

	scrawl.makeTween({
		name: 't_showblock',
		targets: [
			'myblock'
			],
		start: {
			globalAlpha: 0,
			roll: 0
		},
		end: {
			globalAlpha: 0.7,
			roll: -30
		},
		duration: 700
	});
	scrawl.makeTween({
		name: 't_hideblock',
		targets: [
			'myblock'
			],
		start: {
			globalAlpha: 0.7,
			roll: -30
		},
		end: {
			globalAlpha: 0,
			roll: 0
		},
		duration: 600
	});

	scrawl.makeAction({
		name: 'a_bare_0',
		time: 0,
		action: scrawl.animation.t_bare_0
	});
	scrawl.makeAction({
		name: 'a_bare_1200_5',
		time: 1200.5,
		action: scrawl.animation.t_bare_1200_5
	});
	scrawl.makeAction({
		name: 'a_ms_0',
		time: '0ms',
		action: scrawl.animation.t_ms_0
	});
	scrawl.makeAction({
		name: 'a_ms_1773_975',
		time: '1773.975ms',
		action: scrawl.animation.t_ms_1773_975
	});
	scrawl.makeAction({
		name: 'a_s_1_94',
		time: '1.94s',
		action: scrawl.animation.t_s_1_94
	});
	scrawl.makeAction({
		name: 'a_s_1_first',
		time: '1s',
		action: scrawl.animation.t_s_1_first
	});
	scrawl.makeAction({
		name: 'a_s_1_second',
		time: '1s',
		action: scrawl.animation.t_s_1_second
	});
	scrawl.makeAction({
		name: 'a_s_0',
		time: '0s',
		action: scrawl.animation.t_s_0
	});
	scrawl.makeAction({
		name: 'a_percent_0',
		time: '0%',
		action: scrawl.animation.t_percent_0
	});
	scrawl.makeAction({
		name: 'a_percent_40_5_first',
		time: '40.5%',
		action: scrawl.animation.t_percent_40_5_first
	});
	scrawl.makeAction({
		name: 'a_percent_40_5_second',
		time: '40.5%',
		action: scrawl.animation.t_percent_40_5_second
	});
	scrawl.makeAction({
		name: 'a_percent_100',
		time: '100%',
		action: scrawl.animation.t_percent_100
	});
	scrawl.makeAction({
		name: 'a_size',
		time: 450,
		action: scrawl.animation.t_size
	});
	scrawl.makeAction({
		name: 'a_toRed',
		time: 600,
		action: function() {
			scrawl.design.mycolor.set({
				color: 'red'
			});
		},
		reset: function() {
			scrawl.design.mycolor.set({
				color: 'black'
			});
		},
		rollback: function() {
			scrawl.design.mycolor.set({
				color: 'black'
			});
		}
	});
	scrawl.makeAction({
		name: 'a_toBlack',
		time: 1600,
		action: function() {
			scrawl.design.mycolor.set({
				color: 'black'
			});
		},
		rollback: function() {
			scrawl.design.mycolor.set({
				color: 'red'
			});
		}
	});
	scrawl.makeAction({
		name: 'a_showBlock',
		time: 0,
		action: scrawl.animation.t_showblock
	});
	scrawl.makeAction({
		name: 'a_hideBlock',
		time: 1025,
		action: scrawl.animation.t_hideblock,
	});

	subtimeline = scrawl.makeTimeline({
		name: 'mySubTimeline',
		event: 50
	}).add(['a_showBlock', 'a_hideBlock']);

	scrawl.makeAction({
		name: 'a_subtimeline',
		time: 350,
		action: scrawl.animation.mySubTimeline,
		//skipSeek: true,
		reset: function() {
			scrawl.entity.myblock.set({
				globalAlpha: 0,
				roll: 0
			});
		},
		rollback: function() {
			scrawl.entity.myblock.set({
				globalAlpha: 0,
				roll: 0
			});
		},
		complete: function() {
			scrawl.entity.myblock.set({
				globalAlpha: 0,
				roll: 0
			});
		}
	});

	timeline = scrawl.makeTimeline({
		name: 'myTimeline',
		duration: 2000,
		event: 10
	}).add(
		'a_s_1_94', 'a_s_1_first', 'a_s_1_second', 'a_s_0',
		'a_percent_0', 'a_percent_40_5_first', 'a_percent_40_5_second', 'a_percent_100',
		'a_subtimeline'
	).add(['a_size', 'a_toRed', 'a_toBlack', 'a_bare_0', 'a_bare_1200_5', 'a_ms_0', 'a_ms_1773_975']);

	//event listeners
	seekerInput = document.getElementById('seeker');
	seekerInput.value = 0;
	seekerValue = document.getElementById('slideValue');

	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	writeSeeker = function(e) {
		if (e.detail.name === 'myTimeline') {
			seekerInput.value = e.detail.currentTime;
			seekerValue.innerHTML = e.detail.currentTime;
		}
	};
	scrawl.addNativeListener('timeline-updated', writeSeeker, document);

	readSeeker = function(e) {
		stopE(e);
		timeline.seekTo(e.target.value);
		seekerValue.innerHTML = e.target.value;
	};
	scrawl.addNativeListener(['input', 'change'], readSeeker, seekerInput);


	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//code here

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
	extensions: ['phrase', 'animation', 'color', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
