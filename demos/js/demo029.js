var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var pad,
		patternCellGroup;

	//add canvas to web page
	scrawl.addCanvasToPage({
		name: 'canvas',
		parentElement: 'canvasHolder',
		width: 400,
		height: 400,
	}).makeCurrent();
	pad = scrawl.pad.canvas;

	//create a new cell for the pattern
	pad.addNewCell({
		name: 'myCell',
		width: 50,
		height: 50,
		backgroundColor: 'blue',
		shown: false,
	});
	patternCellGroup = scrawl.group.myCell;

	//add entitys to the pattern cell ...
	scrawl.makeLine({
		name: 'guide',
		startX: -25,
		startY: 25,
		endX: 75,
		endY: 25,
		visibility: false,
		group: 'myCell',
	});
	scrawl.makeWheel({
		radius: 10,
		fillStyle: 'red',
		method: 'fill',
		path: 'guide',
		pathPlace: 0.25,
		deltaPathPlace: 0.005,
		handleY: -25,
		group: 'myCell',
	}).clone({
		pathPlace: 0.75,
	}).clone({
		handleY: 25,
	}).clone({
		pathPlace: 0.25,
	}).clone({
		handleY: 0,
		pathPlace: 0.5,
	}).clone({
		pathPlace: 0,
	});

	//build the pattern
	scrawl.makePattern({
		name: 'dotty',
		source: 'myCell',
		autoUpdate: true,
	});

	//add a block entity, for displaying the pattern
	scrawl.makeBlock({
		startX: 200,
		startY: 200,
		handleX: 'center',
		handleY: 'center',
		width: 200,
		height: 200,
		lineWidth: 40,
		lineJoin: 'round',
		lineCaps: 'round',
		method: 'draw',
		strokeStyle: 'dotty',
		roll: 30,
	});

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			patternCellGroup.updateStart();
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
	modules: ['block', 'images', 'path', 'wheel', 'factories', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
