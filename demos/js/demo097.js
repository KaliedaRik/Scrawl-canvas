var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//entitys
	scrawl.makeBlock({
		name: 'block1',
		startX: 50,
		startY: 70,
		fillStyle: 'red',
		strokeStyle: 'blue',
		lineWidth: 5,
		method: 'fillDraw',
		width: 80,
		height: 80,
		handleX: 'center',
		handleY: 'center',
	}).clone({
		name: 'block2',
		startY: 200,
	}).clone({
		name: 'block3',
		startY: 330,
		handleX: 40,
	});

	//tweens
	scrawl.makeTween({
		name: 'tween1',
		targets: scrawl.entity.block1,
		start: {
			startX: 50,
			width: 80,
			roll: 0,
		},
		end: {
			startX: 550,
			width: 20,
			roll: 360,
		},
		duration: 3000,
		count: true,
		autoReverseAndRun: true,
	}).run();
	scrawl.animation.tween1.clone({
		name: 'tween2',
		targets: scrawl.entity.block3,
		duration: 4000,
		start: {
			startX: 50,
			handleX: 40,
			roll: 0,
		},
		end: {
			startX: 550,
			handleX: 140,
			roll: 360,
		},
	}).run();
	scrawl.makeTween({
		name: 'tween3',
		targets: scrawl.entity.block2,
		duration: 2000,
		start: {
			startX: 50,
			width: 80,
		},
		end: {
			startX: 300,
			width: 20,
			roll: 90,
		},
		nextTween: 'tween4',
	}).clone({
		name: 'tween4',
		targets: scrawl.entity.block2,
		start: {
			startX: 300,
			width: 20,
		},
		end: {
			startX: 550,
			width: 80,
			roll: 90,
		},
		nextTween: 'tween5',
	}).clone({
		name: 'tween5',
		targets: scrawl.entity.block2,
		start: {
			startX: 550,
			width: 80,
		},
		end: {
			startX: 300,
			width: 120,
			roll: 90,
		},
		nextTween: 'tween6',
	}).clone({
		name: 'tween6',
		targets: scrawl.entity.block2,
		start: {
			startX: 300,
			width: 120,
		},
		end: {
			startX: 50,
			width: 80,
			roll: 90,
		},
		nextTween: 'tween3',
	});
	scrawl.animation.tween3.run();

	//animation object
	scrawl.makeAnimation({
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
	modules: ['block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
