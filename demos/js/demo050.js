var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myCanvas = scrawl.canvas.mycanvas,
		here = false,
		currentObject = false,
		clickedObject,
		myCol,
		myGroup = scrawl.group[myPad.base],
		createEntity,
		placeEntity;

	//import images into scrawl library
	scrawl.getImagesByClass('demo050');

	//define designs (gradients, colors)
	scrawl.makeColor({
		name: 'myRed',
		color: '#f00'
	});

	myCol = scrawl.makeColor({
		name: 'myBlue',
		random: true,
		aShift: 0.002,
		aBounce: true,
		autoUpdate: true
	});

	scrawl.makeGradient({
		name: 'gradient',
		shift: 0.002,
		lockTo: true,
		color: [{
			color: '#333333',
			stop: 0
        }, {
			color: 'orange',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'green',
			stop: 0.6
        }, {
			color: '#cccccc',
			stop: 0.8
        }, {
			color: '#333333',
			stop: 1
        }]
	});

	//define animation sheets
	scrawl.makeSpriteAnimation({
		name: 'mytiger',
		running: 'forward',
		loop: 'loop',
		frames: [{
			x: (120 * 0),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100
        }, {
			x: (120 * 1),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100
        }, {
			x: (120 * 2),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100
        }, {
			x: (120 * 3),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100
        }, {
			x: (120 * 4),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100
        }],
	});

	//define entitys
	scrawl.makeRegularShape({
		name: 'C0_hello', //for testing clones of Path objects that include underscores in their names
		startX: 420,
		startY: 100,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		order: myGroup.entitys.length,
		method: 'fillDraw'
	});

	scrawl.makePicture({
		source: 'angelfish',
		strokeStyle: 'Gold',
		lineWidth: 3,
		method: 'fillDraw',
		order: myGroup.entitys.length,
		shadowBlur: 4,
		shadowColor: 'Black',
		startX: 80,
		startY: 50,
		scale: 0.3,
		scaleOutline: false
	});

	scrawl.makeBlock({
		strokeStyle: 'Orange',
		fillStyle: 'myBlue',
		lineWidth: 6,
		method: 'fillDraw',
		order: myGroup.entitys.length,
		width: 100,
		height: 100,
		startX: 300,
		startY: 200,
		lineDash: [20, 5]
	});

	scrawl.makeWheel({
		strokeStyle: '#800',
		fillStyle: 'gradient',
		lineWidth: 6,
		method: 'fillDraw',
		radius: 40,
		startX: 600,
		startY: 90,
		lineDash: [20, 5, 5, 5],
		order: myGroup.entitys.length
	});

	scrawl.makePicture({
		startX: 100,
		startY: 300,
		pasteWidth: 120,
		pasteHeight: 66,
		method: 'fill',
		source: 'tiger',
		animation: 'mytiger',
		order: myGroup.entitys.length,
		checkHitUsingImageData: true,
		handleX: 'center',
		handleY: 'center',
		flipReverse: true,
		roll: 10
	});

	scrawl.makePhrase({
		method: 'fill',
		order: myGroup.entitys.length,
		text: 'No! Clone me! Me!',
		startX: 500,
		startY: 300,
		font: '20pt Arial, Helvetica'
	});

	//event listeners
	createEntity = function(e) {
		placeEntity(e);
		here = myPad.getMouse();
		clickedObject = myGroup.getEntityAt(here);
		if (clickedObject) {
			currentObject = clickedObject.clone({
				order: myGroup.entitys.length,
			}).pickupEntity(here);
			if (currentObject.type === 'Block') {
				currentObject.set({
					fillStyle: myCol.clone({
						random: true
					}).name
				});
			}
		}
	};
	scrawl.addListener('down', createEntity, myCanvas);

	placeEntity = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (currentObject) {
			currentObject.dropEntity();
			currentObject = null;
		}
	};
	scrawl.addListener(['up', 'leave'], placeEntity, myCanvas);

	//stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}, myCanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			for (var i = 0, z = myGroup.entitys.length; i < z; i++) {
				if (scrawl.entity[myGroup.entitys[i]].type === 'Path') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						roll: 0.5
					});
				}
				if (scrawl.entity[myGroup.entitys[i]].type === 'Block') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						lineDashOffset: (i % 2 === 0) ? 0.1 : -0.1
					});
				}
				if (scrawl.entity[myGroup.entitys[i]].type === 'Wheel') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						roll: (i % 2 === 0) ? 0.2 : -0.2
					});
				}
			}
			here = myPad.getMouse();
			if (here.active) {
				myCanvas.style.cursor = (myGroup.getEntityAt(here)) ? 'pointer' : 'auto';
			}
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		}
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	//test to prevent multi-loading of modules
	modules: ['animation', 'color', 'factories', 'block', 'wheel', 'images', 'path', 'phrase', 'animation', 'color', 'factories', 'block', 'wheel', 'images', 'path', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
