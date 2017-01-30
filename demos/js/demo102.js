var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.getImagesByClass('demo121');

	var stack = scrawl.stack.myStack,
		pad = scrawl.pad.myCanvas,
		canvas = scrawl.canvas.myCanvas,
		preventDefault,
		counter,
		timeline,
		animationDuration = 1000,
		scrollAction, moveAction,
		addShow, addHide, addFadeIn, addFadeOut,
		canalMillPictureData, demo5_canalMillFullGroup,
		demo5_canalMillHalfGroupStart, demo5_canalMillHalfGroupEnd,
		fishShapeCalculator,
		scrollAmount = 0,
		oldY = 0,
		scrollActive = false,
		touchActive = false,
		here, i, iz,
		anim;

	stack.set({
		width: 800,
		height: 400,
		perspectiveX: '50%',
		perspectiveY: '50%',
		perspectiveZ: 1000
	});

	pad.makeCurrent();

	scrawl.cell[pad.base].set({
		compileOrder: 2
	});

	pad.addNewCell({
		name: 'demo5_canalCell',
		rendered: false,
		compileOrder: 1,
		width: 800,
		height: 400,
		shown: false
	});

	scrawl.makeMultiFilter({
		name: 'demo5_filter',
		filters: scrawl.makeFilter({
			multiFilter: 'demo5_filter',
			species: 'cyan'
		})
	});

	counter = scrawl.makePhrase({
		name: 'demo5_counter',
		startX: '10%',
		startY: '10%',
		handleX: 'center',
		handleY: 'center',
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 3,
		shadowColor: '#330000',
		fillStyle: '#ff2222',
		strokeStyle: '#770000',
		method: 'fillDraw',
		font: '40px Arial, sans-serif',
		order: 20,
		text: '0%'
	});

	scrawl.makePhrase({
		name: 'demo5_introText',
		startX: '20%',
		startY: '20%',
		strokeStyle: '#770000',
		fillStyle: '#ffff22',
		method: 'fillDraw',
		font: '50px bold Arial, sans-serif',
		order: 10,
		text: 'A journey\nalong the\nRiver Lea'
	}).clone({
		name: 'demo5_canalText1',
		startX: '10%',
		startY: '110%',
		visibility: false,
		lineHeight: 3.5,
		text: 'The canal\nhas fish\nin it'
	}).clone({
		name: 'demo5_factoryText',
		startX: '150%',
		startY: '30%',
		handleX: 'center',
		handleY: 'center',
		text: 'Old factories'
	}).clone({
		name: 'demo5_flatText',
		group: 'demo5_canalCell',
		startX: '-50%',
		startY: '30%',
		order: 1,
		text: 'New homes'
	}).clone({
		name: 'demo5_endText',
		startX: '-50%',
		startY: '50%',
		globalAlpha: 0,
		text: 'The End'
	});

	scrawl.makePhrase({
		name: 'demo5_flowerText',
		fillStyle: 'black',
		globalCompositeOperation: 'xor',
		method: 'fill',
		font: '80px bold Arial, sans-serif',
		startX: '50%',
		startY: '50%',
		handleX: '50%',
		handleY: '50%',
		order: 1,
		visibility: false,
		globalAlpha: 0,
		textAlign: 'center',
		lineHeight: 1.1,
		text: 'Flowers\ngrow along\nthe walls'
	});

	scrawl.makePhrase({
		name: 'demo5_millText',
		path: 'demo5_textTrack',
		pathPlace: 0.75,
		strokeStyle: '#770000',
		fillStyle: '#ffff22',
		method: 'fillDraw',
		font: '50px bold Arial, sans-serif',
		order: 10,
		visibility: false,
		addPathRoll: true,
		textAlongPath: true,
		textAlign: 'center',
		text: 'Not all mills look like mills'
	});

	scrawl.makeBlock({
		name: 'demo5_flowerTextBackground',
		width: '100%',
		height: '100%',
		visibility: false,
		order: 0,
	})

	scrawl.makePicture({
		name: 'demo5_train',
		source: 'walkTrain',
		pasteWidth: '100%',
		pasteHeight: '100%',
		copyWidth: '84.21%',
		copyHeight: '100%',
		globalAlpha: 1
	}).clone({
		name: 'demo5_canal1',
		source: 'walkCanal1',
		copyWidth: '100%',
		copyHeight: '35.7%',
		visibility: false,
		keepCopyDimensions: true,
		order: 2,
		globalAlpha: 0
	}).clone({
		name: 'demo5_canalFish',
		source: 'walkCanalFish',
		copyHeight: '100%',
		pasteX: '35%',
		pasteY: '35%',
		pasteWidth: '65%',
		pasteHeight: '65%',
		order: 1,
		globalCompositeOperation: 'source-in',
		globalAlpha: 0.3
	}).clone({
		name: 'demo5_canalFlower',
		source: 'walkCanalFlower',
		pasteWidth: '100%',
		pasteHeight: '100%',
		pasteX: '0%',
		pasteY: '0%',
		// filters: ['demo5_filter'],
		// multiFilter: 'demo5_filter',
		order: 2,
		globalCompositeOperation: 'source-over',
		globalAlpha: 1
	}).clone({
		name: 'demo5_canalFactory',
		source: 'walkCanalFactory',
		// filters: [],
		// multiFilter: '',
		multiFilter: 'demo5_filter',
		globalCompositeOperation: 'destination-over',
		order: 7
	}).clone({
		name: 'demo5_canalFlats',
		group: 'demo5_canalCell',
		source: 'walkCanalFlats',
		multiFilter: '',
		globalCompositeOperation: 'source-over',
		order: 0
	});

	canalMillPictureData = [
		['0%', '20%'], ['0%', '60%'],
		['0%', '0%'], ['0%', '40%'], ['0%', '80%'],
		['10%', '20%'], ['10%', '60%'],
		['20%', '0%'], ['20%', '40%'], ['20%', '80%'],
		['30%', '20%'], ['30%', '60%'],
		['40%', '0%'], ['40%', '40%'], ['40%', '80%'],
		['50%', '20%'], ['50%', '60%'],
		['60%', '0%'], ['60%', '40%'], ['60%', '80%'],
		['70%', '20%'], ['70%', '60%'],
		['80%', '0%'], ['80%', '40%'], ['80%', '80%'],
		['90%', '20%'], ['90%', '60%']
	];
	for (i = 0, iz = canalMillPictureData.length; i < iz; i++) {
		scrawl.makePicture({
			name: 'demo5_canalMill' + i,
			source: 'walkCanalMill',
			copyWidth: '0%',
			copyHeight: '20%',
			pasteWidth: '0%',
			pasteHeight: '20%',
			copyX: canalMillPictureData[i][0],
			copyY: canalMillPictureData[i][1],
			startX: canalMillPictureData[i][0],
			startY: canalMillPictureData[i][1],
			order: 3,
			globalAlpha: 1,
			visibility: false
		});
	}
	demo5_canalMillHalfGroupEnd = ['demo5_canalMill0', 'demo5_canalMill1'];
	demo5_canalMillHalfGroupStart = ['demo5_canalMill25', 'demo5_canalMill26'];
	demo5_canalMillFullGroup = [
		'demo5_canalMill2', 'demo5_canalMill3', 'demo5_canalMill4', 'demo5_canalMill5',
		'demo5_canalMill6', 'demo5_canalMill7', 'demo5_canalMill8', 'demo5_canalMill9',
		'demo5_canalMill10', 'demo5_canalMill11', 'demo5_canalMill12', 'demo5_canalMill13',
		'demo5_canalMill14', 'demo5_canalMill15', 'demo5_canalMill16', 'demo5_canalMill17',
		'demo5_canalMill18', 'demo5_canalMill19', 'demo5_canalMill20', 'demo5_canalMill21',
		'demo5_canalMill22', 'demo5_canalMill23', 'demo5_canalMill24'];

	scrawl.makeShape({
		name: 'demo5_mainline',
		startX: '10%',
		startY: '4%',
		data: 'm0,0 h640 v8 m-160,0 v-8 m-160,0 v8 m-160,0 v-8 m-160,0 v8',
		lineWidth: 4,
		lineCap: 'round',
		lineJoin: 'round',
		strokeStyle: '#770000',
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 3,
		shadowColor: '#330000',
		order: 9
	});

	scrawl.makeRegularShape({
		name: 'demo5_canalFishStencil',
		startX: '70%',
		startY: '70%',
		method: 'fill',
		shadowColor: 'black',
		shadowBlur: 20,
		radius: 120,
		angle: 15,
		lineType: "t",
		shape: true,
		visibility: false,
		scale: 0.1,
		order: 0,
		globalAlpha: 1
	});

	scrawl.makeRegularShape({
		name: 'demo5_millPaddle',
		startX: '50%',
		startY: '100%',
		radius: 150,
		angle: 30,
		startControlX: 120,
		startControlY: 10,
		endControlX: -160,
		endControlY: -60,
		lineType: "c",
		lineWidth: 3,
		shadowColor: 'black',
		shadowBlur: 4,
		method: 'draw',
		strokeStyle: 'white',
		visibility: false,
		globalAlpha: 0,
		order: 5,
		shape: true
	}).clone({
		name: 'demo5_millPaddleInner',
		lineWidth: 2,
		scale: 0.6,
	});

	scrawl.makeEllipse({
		name: 'demo5_textTrack',
		startX: '50%',
		startY: '100%',
		radiusX: '27%',
		radiusY: '54%',
		method: 'none',
		precision: 200,
		visibility: false
	})

	scrawl.makeFrame({
		name: 'demo5_frame',
		startX: '40%',
		startY: '90%',
		handleX: '250%',
		handleY: '50%',
		width: '100%',
		height: '100%',
		lockFrameTo: 'demo5_flats',
		pitch: 87,
		yaw: 305,
		roll: 0,
		order: 8,
		visibility: false,
		globalAlpha: 0.5,
		method: 'fill',
		source: 'demo5_canalCell'
	});

	timeline = scrawl.makeTicker({
		name: 'demo5_timeline',
		duration: animationDuration
	});

	fishShapeCalculator = function(start, change, position) {
		var s, d, y;
		y = start + (position * change);
		s = scrawl.makeRegularShape({
			name: 'demo5_temporary_shape',
			radius: 120,
			angle: 15,
			startControlX: -200,
			startControlY: y,
			lineType: "t",
			shape: true,
			visibility: false
		});
		d = s.data;
		scrawl.deleteEntity('demo5_temporary_shape');
		return d;
	};

	addFadeIn = {
		attribute: 'globalAlpha',
		start: 0,
		end: 1
	};
	addFadeOut = {
		attribute: 'globalAlpha',
		start: 1,
		end: 0
	};
	scrawl.makeTween({
		name: 'demo5_tweens',
		ticker: 'demo5_timeline',
		targets: 'demo5_counter',
		time: '0%',
		duration: '100%',
		definitions: [{
			attribute: 'startX',
			start: '10%',
			end: '90%'
		}]
	}).clone({
		targets: 'demo5_train',
		duration: '20%',
		definitions: [{
			attribute: 'copyX',
			start: '0%',
			end: '78%',
			engine: 'easeOut3'
		}, {
			attribute: 'copyY',
			start: '0%',
			end: '43%',
			engine: 'easeOut3'
		}, {
			attribute: 'copyWidth',
			start: '84.21%',
			end: '25%',
			engine: 'easeOut3'
		}, {
			attribute: 'copyHeight',
			start: '100%',
			end: '30%',
			engine: 'easeOut3'
		}]
	}).clone({
		targets: 'demo5_introText',
		time: '5%',
		duration: '12%',
		definitions: [{
			attribute: 'startX',
			start: '20%',
			end: '-35%',
			engine: 'easeOut3'
		}]
	}).clone({
		targets: 'demo5_canal1',
		time: '16%',
		duration: '6%',
		definitions: [addFadeIn]
	}).clone({
		targets: 'demo5_train',
		definitions: [addFadeOut]
	}).clone({
		targets: 'demo5_canal1',
		time: '19%',
		duration: '16%',
		definitions: [{
			attribute: 'copyY',
			start: '0%',
			end: '64.3%',
			engine: 'easeOutIn'
		}]
	}).clone({
		targets: 'demo5_canalText1',
		time: '23%',
		duration: '8%',
		definitions: [{
			attribute: 'startY',
			start: '105%',
			end: '20%',
			engine: 'easeIn'
		}, {
			attribute: 'lineHeight',
			start: 3.5,
			end: 1,
			engine: 'easeIn'
		}]
	}).clone({
		targets: 'demo5_canalFishStencil',
		time: '30%',
		duration: '10%',
		definitions: [{
			attribute: 'scale',
			start: 0.1,
			end: 1.4
		}, {
			attribute: 'startX',
			start: '60%',
			end: '85%'
		}, {
			attribute: 'startY',
			start: '60%',
			end: '85%'
		}, {
			attribute: 'data',
			start: 20,
			end: 120,
			engine: fishShapeCalculator
		}]
	}).clone({
		targets: ['demo5_canalText1', 'demo5_canalFishStencil'],
		time: '37%',
		duration: '4%',
		definitions: [addFadeOut]
	}).clone({
		targets: demo5_canalMillFullGroup,
		duration: '8%',
		definitions: [{
			attribute: 'copyWidth',
			start: '0%',
			end: '20%'
		}, {
			attribute: 'pasteWidth',
			start: '0%',
			end: '20%'
		}]
	}).clone({
		targets: demo5_canalMillHalfGroupStart,
		duration: '4%',
		definitions: [{
			attribute: 'copyWidth',
			start: '0%',
			end: '10%'
		}, {
			attribute: 'pasteWidth',
			start: '0%',
			end: '10%'
		}]
	}).clone({
		targets: demo5_canalMillHalfGroupEnd,
		time: '41%'
	}).clone({
		targets: ['demo5_millPaddle', 'demo5_millPaddleInner'],
		time: '46%',
		definitions: [addFadeIn]
	}).clone({
		targets: ['demo5_millPaddle', 'demo5_millPaddleInner', 'demo5_textTrack'],
		duration: '14%',
		definitions: [{
			attribute: 'roll',
			start: 0,
			end: -360
		}]
	}).clone({
		targets: ['demo5_millPaddle', 'demo5_millPaddleInner'],
		time: '60%',
		duration: '7%',
		definitions: [{
			attribute: 'roll',
			start: 0,
			end: -180
		}]
	}).clone({
		targets: [].concat(demo5_canalMillFullGroup, demo5_canalMillHalfGroupStart, demo5_canalMillHalfGroupEnd),
		time: '61%',
		duration: '6%',
		definitions: [{
			attribute: 'roll',
			start: 0,
			end: 180
		}, {
			attribute: 'scale',
			start: 1,
			end: 0.1
		}]
	}).clone({
		targets: ['demo5_millPaddle', 'demo5_millPaddleInner'],
		time: '63%',
		duration: '4%',
		definitions: [addFadeOut]
	}).clone({
		targets: 'demo5_flowerText',
		time: '69%',
		duration: '6%',
		definitions: [{
			attribute: 'globalAlpha',
			start: 0,
			end: 1,
			engine: 'easeIn'
		}]
	}).clone({
		time: '70%',
		duration: '17%',
		definitions: [{
			attribute: 'scale',
			start: 1,
			end: 1.8,
			engine: 'easeOut'
		}]
	}).clone({
		targets: 'demo5_canalFlower',
		time: '72%',
		duration: '10%',
		definitions: [{
			attribute: 'alpha',
			start: 0,
			end: 1,
			engine: 'easeIn'
		}]
	}).clone({
		targets: 'demo5_flowerText',
		time: '77%',
		duration: '6%',
		definitions: [{
			attribute: 'globalAlpha',
			start: 1,
			end: 0,
			engine: 'easeOut'
		}]
	}).clone({
		targets: ['demo5_flowerTextBackground', 'demo5_canalFlower'],
		time: '83%',
		duration: '4%',
		definitions: [addFadeOut]
	}).clone({
		targets: 'demo5_frame',
		time: '87%',
		duration: '8%',
		definitions: [{
			attribute: 'handleX',
			start: '250%',
			end: '50%'
		}]
	}).clone({
		targets: 'demo5_factoryText',
		time: '89%',
		duration: '6%',
		definitions: [{
			attribute: 'startX',
			start: '150%',
			end: '50%',
			engine: 'easeIn'
		}]
	}).clone({
		targets: 'demo5_frame',
		time: '91%',
		duration: '8%',
		definitions: [{
			attribute: 'startX',
			start: '40%',
			end: '50%',
			engine: 'easeOut'
		}, {
			attribute: 'startY',
			start: '90%',
			end: '50%',
			engine: 'easeOut'
		}, {
			attribute: 'globalAlpha',
			start: 0.5,
			end: 1,
			engine: 'easeOut'
		}, {
			attribute: 'scale',
			start: 1,
			end: 1.1,
			engine: 'easeOut'
		}, {
			attribute: 'pitch',
			start: 87,
			end: 0,
			engine: 'easeOut'
		}, {
			attribute: 'yaw',
			start: 305,
			end: 360,
			engine: 'easeOut'
		}]
	}).clone({
		targets: 'demo5_flatText',
		time: '93%',
		duration: '6%',
		definitions: [{
			attribute: 'startX',
			start: '-50%',
			end: '50%',
			engine: 'easeIn'
		}]
	}).clone({
		targets: ['demo5_factoryText'],
		definitions: [addFadeOut]
	}).clone({
		targets: ['demo5_endText'],
		time: '96%',
		duration: '2%',
		definitions: [addFadeIn]
	}).clone({
		targets: 'demo5_endText',
		duration: '3.5%',
		definitions: [{
			attribute: 'startX',
			start: '-50%',
			end: '50%',
			engine: 'easeIn'
		}]
	});

	addShow = {
		action: function() {
			this.updateTargets({
				visibility: true
			})
		},
		revert: function() {
			this.updateTargets({
				visibility: false
			})
		}
	};
	addHide = {
		action: function() {
			this.updateTargets({
				visibility: false
			})
		},
		revert: function() {
			this.updateTargets({
				visibility: true
			})
		}
	};
	scrawl.makeAction({
		name: 'demo5_actions',
		ticker: 'demo5_timeline',
		targets: 'demo5_canal1',
		time: '15.5%'
	}).set(addShow).clone({
		targets: 'demo5_introText',
		time: '17.5%'
	}).set(addHide).clone({
		targets: 'demo5_train',
		time: '22.5%'
	}).set(addHide).clone({
		targets: ['demo5_canalText1', 'demo5_canalFish', 'demo5_canalFishStencil'],
	}).set(addShow).clone({
		targets: 'demo5_canal1',
		time: '30%',
		action: function() {
			this.updateTargets({
				globalCompositeOperation: 'destination-over'
			})
		},
		revert: function() {
			this.updateTargets({
				globalCompositeOperation: 'source-over'
			})
		}
	}).clone({
		targets: [].concat(demo5_canalMillFullGroup, demo5_canalMillHalfGroupStart, demo5_canalMillHalfGroupEnd),
		time: '37%'
	}).set(addShow).clone({
		targets: ['demo5_canalFish', 'demo5_canalFishStencil', 'demo5_canalText1'],
		time: '41.5%'
	}).set(addHide).clone({
		targets: 'demo5_canal1',
		time: '45.5%'
	}).set(addHide).clone({
		targets: ['demo5_millText', 'demo5_textTrack', 'demo5_millPaddle', 'demo5_millPaddleInner'],
	}).set(addShow).clone({
		targets: 'demo5_canalFlower',
		time: '60.5%'
	}).set(addShow).clone({
		targets: [
			'demo5_millText', 'demo5_textTrack', 'demo5_millPaddle', 'demo5_millPaddleInner'
			].concat(
			demo5_canalMillFullGroup, demo5_canalMillHalfGroupStart, demo5_canalMillHalfGroupEnd),
		time: '68%'
	}).set(addHide).clone({
		targets: ['demo5_flowerTextBackground', 'demo5_flowerText', 'demo5_canalFactory'],
	}).set(addShow).clone({
		targets: 'demo5_canalFlower',
		time: '68.5%',
		action: function() {
			this.updateTargets({
				globalCompositeOperation: 'source-in'
			})
		},
		revert: function() {
			this.updateTargets({
				globalCompositeOperation: 'source-over'
			})
		}
	}).clone({
		targets: 'demo5_canalFactory',
		time: '82.5%',
		action: function() {
			this.updateTargets({
				multiFilter: ''
			})
		},
		revert: function() {
			this.updateTargets({
				multiFilter: 'demo5_filter'
			})
		}
	}).clone({
		targets: 'demo5_canalFactory',
		time: '87%',
		action: function() {
			this.updateTargets({
				globalCompositeOperation: 'source-over'
			})
		},
		revert: function() {
			this.updateTargets({
				globalCompositeOperation: 'destination-over'
			})
		}
	}).clone({
		targets: ['demo5_flowerTextBackground', 'demo5_canalFlower', 'demo5_flowerText'],
	}).set(addHide).clone({
		targets: ['demo5_factoryText', 'demo5_frame', 'demo5_canalFlats', 'demo5_flatText'],
	}).set(addShow).clone({
		targets: 'demo5_canalCell',
		action: function() {
			this.updateTargets({
				rendered: true
			})
		},
		revert: function() {
			this.updateTargets({
				rendered: false
			})
		}
	}).clone({
		targets: 'demo5_endText',
		time: '96%',
	}).set(addShow);

	scrollAction = function(e) {
		var delta = e.deltaY,
			test;
		preventDefault(e);
		if (!scrawl.isBetween(delta, -5, 5, true)) {
			delta = (delta < 0) ? -5 : 5;
		}
		scrollAmount += delta;
		test = scrawl.isBetween(scrollAmount, 0, animationDuration, true);
		if (scrollActive && !test) {
			scrollActive = false;
		}
		if (!test) {
			scrollAmount = (scrollAmount > animationDuration / 2) ? animationDuration : 0;
		}
		counter.set({
			text: parseInt(scrollAmount / 10) + '%'
		});
		timeline.seekTo(scrollAmount);
	};
	moveAction = function(e) {
		if (touchActive) {
			here = pad.getMouse();
			if (here.active) {
				e.deltaY = oldY - here.y;
				scrollAction(e);
				oldY = here.y;
			}
		}
	};

	scrawl.addNativeListener(['wheel'], scrollAction, canvas);
	scrawl.addListener(['move'], moveAction, canvas);
	scrawl.addListener(['down'], function() {
		here = pad.getMouse();
		oldY = here.y;
		touchActive = true;
	}, canvas);
	scrawl.addListener(['up', 'leave'], function() {
		touchActive = false;
	}, canvas);

	scrawl.makeAnimation({
		fn: function() {

			stack.render();
			pad.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

	preventDefault = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks', 'phrase', 'images', 'block', 'path', 'factories', 'animation', 'multifilters', 'shape', 'frame'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
