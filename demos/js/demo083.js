var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var pad,
		canvas,
		engine,
		ctx,
		original,
		topline,
		baseline,
		myGroup,
		here,
		mySprite = false,
		getWheel,
		dropWheel,
		doTransform,
		updateScene;

	//add canvas to web page
	scrawl.addCanvasToPage({
		canvasName: 'canvas',
		parentElement: 'canvasHolder',
		width: 400,
		height: 400,
	}).makeCurrent();
	pad = scrawl.pad.canvas;
	canvas = scrawl.canvas.canvas;
	engine = scrawl.context[pad.base];
	ctx = scrawl.ctx[pad.base];

	//create a holding cell for the original scene ...
	pad.addNewCell({
		name: 'original',
		width: 400,
		height: 200,
		backgroundColor: 'lightblue',
	});
	original = scrawl.canvas.original;

	//... and a Phrase sprite to place on the holding cell
	scrawl.newPhrase({
		text: 'HELLO',
		font: '80pt 900 Arial, sans-serif',
		startX: 200,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		fillStyle: 'red',
		strokeStyle: 'blue',
		lineWidth: 3,
		method: 'fillDraw',
		group: 'original',
	});

	//compile the cell once - no need to include it in the animation loop
	pad.compile('original');

	//we need some guide lines to tell us how we want the text to bend ...
	topline = scrawl.makeQuadratic({
		name: 'topline',
		lineWidth: 4,
		strokeStyle: 'yellow',
	});
	baseline = scrawl.makeQuadratic({
		name: 'baseline',
		lineWidth: 4,
		strokeStyle: 'orange',
	});

	//... and some circles to grab onto, to manipulate the guide lines
	myGroup = scrawl.newGroup({
		name: 'myGroup',
	});
	for (var i = 0; i < 6; i++) {
		scrawl.newWheel({
			name: 'wheel_' + i,
			radius: 10,
			lineWidth: 2,
			lockX: true,
			order: 1,
			group: 'myGroup',
			globalAlpha: 0.6,
			fillStyle: 'grey',
			method: 'fillDraw',
		});
	}
	//set the circles' start coordinates and styling ...
	scrawl.sprite.wheel_0.set({
		startX: 0,
		startY: 100
	});
	scrawl.sprite.wheel_1.set({
		startX: 200,
		startY: 100
	});
	scrawl.sprite.wheel_2.set({
		startX: 400,
		startY: 100
	});
	scrawl.sprite.wheel_3.set({
		startX: 0,
		startY: 300
	});
	scrawl.sprite.wheel_4.set({
		startX: 200,
		startY: 300
	});
	scrawl.sprite.wheel_5.set({
		startX: 400,
		startY: 300
	});

	//... and fix guide line points to circles
	scrawl.point.topline_p1.setToFixed('wheel_0');
	scrawl.point.topline_p2.setToFixed('wheel_1');
	scrawl.point.topline_p3.setToFixed('wheel_2');
	scrawl.point.baseline_p1.setToFixed('wheel_3');
	scrawl.point.baseline_p2.setToFixed('wheel_4');
	scrawl.point.baseline_p3.setToFixed('wheel_5');

	//event listeners, for drag-dropping the circles
	getWheel = function(e) {
		mySprite = myGroup.getSpriteAt(here);
		if (mySprite) {
			mySprite.pickupSprite(here);
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	dropWheel = function(e) {
		if (mySprite) {
			mySprite.dropSprite();
			mySprite = false;
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	canvas.addEventListener('mousedown', getWheel, false);
	canvas.addEventListener('mouseup', dropWheel, false);

	//going to do the text transform 'raw' - painting directly onto the canvas's base cell
	doTransform = function() {
		var topCoords,
			baseCoords,
			myStart,
			myHeight;
		topline.buildPositions();
		baseline.buildPositions();
		ctx.globalAlpha = 1; //to keep cell context, and canvas element context engine, values in sync
		engine.globalAlpha = 1;
		engine.setTransform(1, 0, 0, 1, 0, 0);
		for (var x = 0; x < 400; x++) {
			//getPerimeterPosition returns a reference to a scrawl.work vector
			//	- effectively, topCoords and baseCoords reference the same vector (with x, y attributes)
			//	- thus results need to be copied (not referenced) to a new variable immediately 
			topCoords = topline.getPerimeterPosition(x / 400, true, false).y;
			baseCoords = baseline.getPerimeterPosition(x / 400, true, false).y;
			myStart = (baseCoords > topCoords) ? topCoords : baseCoords;
			myHeight = (baseCoords > topCoords) ? baseCoords - topCoords : topCoords - baseCoords;
			engine.drawImage(original, x, 0, 1, 200, x, myStart, 1, myHeight);
		}
	};

	//animation function
	updateScene = function() {
		pad.clear('base');
		pad.compile('base');
		doTransform();
		myGroup.stamp();
		pad.show();
	};

	//initialize scene
	updateScene();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = pad.getMouse();
			if (!here.active && mySprite) {
				dropWheel();
			}
			//only refresh the scene if guidelines have changed
			if (mySprite) {
				updateScene();
			}

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
	modules: ['animation', 'phrase', 'wheel', 'factories', 'path'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
