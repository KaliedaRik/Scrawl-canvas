var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//sprites
	scrawl.newWheel({
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
	scrawl.newTween({
		name: 'tween1',
		targets: scrawl.sprite.circle1,
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
		targets: scrawl.sprite.circle2,
		duration: 4000,
		onComplete: {
			startX: 300,
			globalAlpha: 1,
		},
	}).run();
	scrawl.animation.tween1.clone({
		targets: scrawl.sprite.circle3,
		duration: 2500,
		count: 2,
		autoReverseAndRun: true,
	}).run();
	scrawl.animation.tween1.clone({
		targets: scrawl.sprite.circle4,
		duration: 3000,
		count: true,
		autoReverseAndRun: true,
	}).run();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
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