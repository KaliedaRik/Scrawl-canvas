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
		patternGroup,
		dotty,
		frame;

	//add canvass to web page
	scrawl.addCanvasToPage({
		canvasName: 'canvas',
		parentElement: 'canvasHolder',
		width: 400,
		height: 400,
	}).makeCurrent();
	pad = scrawl.pad.canvas;

	//create a new cell for the pattern
	pad.addNewCell({
		name: 'patternCell',
		width: 50,
		height: 50,
		backgroundColor: 'blue',
	});
	patternGroup = scrawl.group.patternCell;

	//add entitys to the pattern cell ...
	scrawl.newWheel({
		radius: 10,
		fillStyle: 'red',
		method: 'fill',
		group: 'patternCell',
	}).clone({
		startX: 50,
	}).clone({
		startY: 50,
	}).clone({
		startX: 0,
	}).clone({
		startX: 25,
		startY: 25,
	});
	//... and compile it
	scrawl.cell.patternCell.compile();

	//build the pattern
	dotty = scrawl.newPattern({
		name: 'dotty',
		canvas: 'patternCell',
	});

	//add a block entity, for showing off the pattern
	frame = scrawl.newBlock({
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
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			frame.setDelta({
				roll: 0.5,
			});
			pad.render();

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
	modules: ['block', 'wheel', 'animation', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
