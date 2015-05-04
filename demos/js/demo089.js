var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPics,
		myTexts;

	//import images into scrawl library
	scrawl.getImagesByClass('demo089');

	//define groups
	myPics = scrawl.makeGroup({
		name: 'pics',
	});
	myTexts = scrawl.makeGroup({
		name: 'texts',
	});

	//define entitys
	scrawl.makePicture({
		name: 'b0',
		source: 'fraud',
		width: 120,
		height: 120,
		lineWidth: 7,
		strokeStyle: 'yellow',
		method: 'fill',
		startX: 100,
		startY: 100,
		shadowOffsetX: 5,
		shadowOffsetY: 5,
		shadowBlur: 3,
		shadowColor: 'black',
		handleX: 60,
		handleY: 60,
		order: 0,
		group: 'pics',
	}).clone({
		name: 'b1',
		method: 'draw',
		startX: 300,
	}).clone({
		name: 'b2',
		method: 'fillDraw',
		startX: 500,
	}).clone({
		name: 'b3',
		method: 'drawFill',
		startX: 100,
		startY: 300,
	}).clone({
		name: 'b4',
		method: 'floatOver',
		startX: 300,
	}).clone({
		name: 'b5',
		method: 'sinkInto',
		startX: 500,
	});
	scrawl.makePhrase({
		name: 'p0',
		handleX: 'center',
		handleY: 'center',
		font: '14pt bold Arial, sans-serif',
		pivot: 'b0',
		text: 'fill',
		order: 1,
		group: 'texts',
	}).clone({
		name: 'p1',
		pivot: 'b1',
		text: 'draw',
	}).clone({
		name: 'p2',
		pivot: 'b2',
		text: 'fillDraw',
	}).clone({
		name: 'p3',
		pivot: 'b3',
		text: 'drawFill',
	}).clone({
		name: 'p4',
		pivot: 'b4',
		text: 'floatOver',
	}).clone({
		name: 'p5',
		pivot: 'b5',
		text: 'sinkInto',
	});

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			myPics.updateEntitysBy({
				roll: 1,
			});
			myTexts.updateEntitysBy({
				roll: -1,
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
	extensions: ['images', 'phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
