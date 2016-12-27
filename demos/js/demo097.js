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
		startX: 100,
		startY: 100,
		fillStyle: 'red',
		strokeStyle: 'blue',
		lineWidth: 3,
		method: 'fillDraw',
		width: 100,
		height: 60,
		handleY: '140%',
		handleX: 'center',
	});

	// ticker
	scrawl.makeTicker({
		name: 'myTicker',
		cycles: 0
	});

	// tweens
	scrawl.makeTween({
		name: 'tween1',
		ticker: 'myTicker',
		duration: 4000,
		time: 0,
		targets: 'block1',
		definitions: [
			{
				attribute: 'startX',
				start: 100,
				end: 500,
				engine: 'easeOutIn3',
			}
		]
	}).clone({
		name: 'tween5',
		time: 8000,
		definitions: [
			{
				attribute: 'startX',
				start: 500,
				end: 100,
				engine: 'easeOutIn3',
			}
		]
	}).clone({
		name: 'tween3',
		time: 5000,
		duration: 2000,
		definitions: [
			{
				attribute: 'startY',
				start: 100,
				end: 300,
				engine: 'easeOutIn3',
			}
		]
	}).clone({
		name: 'tween7',
		time: 13000,
		definitions: [
			{
				attribute: 'startY',
				start: 300,
				end: 100,
				engine: 'easeOutIn3',
			}
		]
	}).clone({
		name: 'tween2',
		time: 4000,
		duration: 1000,
		definitions: [
			{
				attribute: 'roll',
				start: 0,
				end: 90,
				engine: 'easeOutIn',
			}
		]
	}).clone({
		name: 'tween4',
		time: 7000,
		definitions: [
			{
				attribute: 'roll',
				start: 90,
				end: 180,
				engine: 'easeOutIn',
			}
		]
	}).clone({
		name: 'tween6',
		time: 12000,
		definitions: [
			{
				attribute: 'roll',
				start: 180,
				end: 270,
				engine: 'easeOutIn',
			}
		]
	}).clone({
		name: 'tween8',
		time: 15000,
		definitions: [
			{
				attribute: 'roll',
				start: 270,
				end: 360,
				engine: 'easeOutIn',
			}
		]
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
