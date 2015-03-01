var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var here,
		there = scrawl.makeVector(),
		coordinates = [],
		data,
		color = [],
		myPad,
		myLine;

	//add canvas to web page ...
	scrawl.addCanvasToPage({
		name: 'canvas',
		parentElement: 'canvashost',
		width: 400,
		height: 300,
	}).makeCurrent();
	myPad = scrawl.pad.canvas;

	//... and add two extra cells to it
	myPad.addNewCell({
		name: 'hidden',
		showOrder: 2,
		shown: false,
	});
	myPad.addNewCell({
		name: 'background',
		showOrder: 1,
	});

	//build a gradient for the background display
	for (var i = 0; i < 1; i += 0.1) {
		color.push({
			color: '#8888ff',
			stop: i
		});
		color.push({
			color: '#aaffff',
			stop: (i + 0.05)
		});
	}
	color.push({
		color: '#8888ff',
		stop: 0.9999
	});
	scrawl.makeGradient({
		name: 'gradient',
		startX: -100,
		startY: -100,
		endX: 500,
		endY: 400,
		color: color,
		shift: 0.001,
		autoUpdate: true,
	});

	//add a entity to display the gradient in the background ...
	scrawl.newBlock({
		name: 'curtain',
		width: 400,
		height: 300,
		method: 'fill',
		fillStyle: 'gradient',
		group: 'background',
		order: 0,
	});

	//set up a Shape entity for drawing the thick line on the hidden cell
	myLine = scrawl.newShape({
		name: 'reveal',
		method: 'draw',
		lineWidth: 70,
		lineJoin: 'round',
		lineCap: 'round',
		shadowBlur: 15,
		shadowColor: 'black',
		strokeStyle: 'black',
		data: 'M0,0',
		order: 0,
		group: 'hidden',
	});

	//animation entity sheet for the cat entity
	scrawl.newSpriteAnimation({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: 1.2,
		frames: [{
			x: 0,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, ],
	});
	//the cat entity stamps over the line, so only part of the image is visible
	scrawl.newPicture({
		name: 'runningcat',
		startX: 200,
		startY: 150,
		handleX: 'center',
		handleY: 'center',
		width: 512,
		height: 256,
		roll: -30,
		url: 'img/runningcat.png',
		animation: 'animatedCat',
		order: 1,
		group: 'hidden',
		//known browser issue: Safari renders 'source-in' GCO incorrectly
		globalCompositeOperation: 'source-in',
		callback: function() {
			scrawl.cell.hidden.set({
				shown: true,
			});
		},
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			//get current mouse coordinates over the visible canvas
			here = myPad.getMouse();

			//the line is dynamic - freehand drawing
			if (coordinates.length > 60) {
				//limit the length of the line
				coordinates.shift();
			}
			if (here.active && !there.isLike(here)) {
				//if mouse has moved, extend the line ...
				coordinates.push(here.getData());
				//remember where the cursor has been
				there.set(here);
			}
			else {
				//... otherwise truncate it
				coordinates.shift();
			}
			//build the data for the line ...
			if (coordinates.length > 0) {
				data = 'M0,0M';
				for (var i = 0, z = coordinates.length; i < z; i++) {
					data += coordinates[i].x + ',' + coordinates[i].y + ' ';
				}
			}
			else {
				data = 'M0,0';
			}
			//... and update it with the new data
			myLine.set({
				data: data,
			});

			//render the scene
			myPad.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + ' - ' + myLine.data;
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'shape', 'block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
