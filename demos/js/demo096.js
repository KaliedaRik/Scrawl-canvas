var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// entitys
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
		roll: 90
	});

	// tickers
	scrawl.makeTicker({
		name: 'myTicker',
		duration: 4000,
		cycles: 0
	});

	// tweens
	scrawl.makeTween({
		name: 'tween1',
		ticker: 'myTicker',
		duration: '50%',
		time: '25%',
		targets: 'circle1',
		reverseOnCycleEnd: true,
		definitions: [
			{
				attribute: 'startX',
				start: 50,
				end: 550,
				engine: 'easeOutIn3',
				integer: true
			},
			{
				attribute: 'globalAlpha',
				start: 1,
				end: 0.3,
				engine: 'linear'
			},
			{
				attribute: 'roll',
				start: 0,
				end: 360,
				engine: 'easeOutIn3'
			}
		]
	}).clone({
		name: 'tween2',
		time: 0,
		duration: 3000,
		targets: 'circle2',
		definitions: [
			{
				attribute: 'startX',
				start: 50,
				end: 550,
				engine: 'easeIn3'
			}
		]
	});

	scrawl.animation.myTicker.run();


	scrawl.makeTween({
		name: 'tween3',
		duration: '4s',
		targets: 'circle3',
		cycles: 5,
		reverseOnCycleEnd: true,
		definitions: [
			{
				attribute: 'startX',
				start: '10%',
				end: '90%',
				engine: 'easeIn4'
			},
			{
				attribute: 'scale',
				start: 1,
				end: 0.2
			}
		]
	}).run();

	scrawl.tween.tween3.clone({
		name: 'tween4',
		targets: 'circle4',
		definitions: [
			{
				attribute: 'startX',
				start: '10%',
				end: '90%',
				engine: 'easeOut4'
			},
			{
				attribute: 'startAngle',
				start: 0,
				end: 90
			},
			{
				attribute: 'endAngle',
				start: 360,
				end: 270
			},
			{
				attribute: 'handleX',
				engine: 'easeOut4',
				start: 0,
				end: -40
			}
		]
	}).run();

	//animation object
	scrawl.makeAnimation({
		order: 1,
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
	extensions: ['wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
