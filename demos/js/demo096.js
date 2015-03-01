var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//entitys
	scrawl.makeWheel({
		name: 'circle1',
		startX: 50,
		startY: 50,
		fillStyle: 'red',
		strokeStyle: 'blue',
		lineWidth: 5,
		lineDash: [20, 10],
		lineDashOffset: 0,
		method: 'fillDraw',
		radius: 40,
	}).clone({
		name: 'circle2',
		startY: 150,
	}).clone({
		name: 'circle3',
		startY: 250,
	}).clone({
		name: 'circle4',
		startY: 350,
	});

	//tweens
	scrawl.makeTween({
		name: 'tween1',
		targets: scrawl.entity.circle1,
		start: {
			startX: 50,
			globalAlpha: 1,
			scale: 1,
		},
		end: {
			startX: 550,
			globalAlpha: 0.2,
			lineDashOffset: -100,
			scale: 0.4,
		},
		duration: 3500,
	}).run();
	scrawl.animation.tween1.clone({
		targets: scrawl.entity.circle2,
		start: {
			startX: '9.2%',
			globalAlpha: 1,
			scale: 1,
		},
		end: {
			startX: '91%',
			globalAlpha: 0.2,
			lineDashOffset: -100,
			scale: 1.3,
		},
		onComplete: {
			startX: '9.2%',
		},
		count: 4,
		autoReverseAndRun: true,
	}).run();
	scrawl.animation.tween1.clone({
		targets: scrawl.entity.circle3,
		duration: 2500,
		count: 2,
		autoReverseAndRun: true,
	}).run();
	scrawl.animation.tween1.clone({
		targets: scrawl.entity.circle4,
		duration: 3000,
		count: true,
		autoReverseAndRun: true,
	}).run();

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
	modules: ['wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
