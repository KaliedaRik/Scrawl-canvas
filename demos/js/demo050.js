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
		handleEntity;

	//import images into scrawl library
	scrawl.getImagesByClass('demo050');

	//define designs (gradients, colors)
	scrawl.newColor({
		name: 'myRed',
		color: '#f00',
	});

	myCol = scrawl.newColor({
		name: 'myBlue',
		random: true,
		aShift: 0.002,
		aBounce: true,
		autoUpdate: true,
	});

	scrawl.newGradient({
		name: 'gradient',
		shift: 0.002,
		setToEntity: true,
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
        }, ],
	});

	//define animation sheets
	scrawl.newSpriteAnimation({
		name: 'mytiger',
		running: 'forward',
		loop: 'loop',
		frames: [{
			x: (120 * 0),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 3),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 4),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }],
	});

	//define entitys
	scrawl.makeRegularShape({
		startX: 420,
		startY: 100,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		order: myGroup.entitys.length,
		method: 'fillDraw',
	});

	scrawl.newPicture({
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
		scaleOutline: false,
	});

	scrawl.newBlock({
		strokeStyle: 'Orange',
		fillStyle: 'myBlue',
		lineWidth: 6,
		method: 'fillDraw',
		order: myGroup.entitys.length,
		width: 100,
		height: 100,
		startX: 300,
		startY: 200,
		lineDash: [20, 5],
	});

	scrawl.newWheel({
		strokeStyle: '#800',
		fillStyle: 'gradient',
		lineWidth: 6,
		method: 'fillDraw',
		radius: 40,
		startX: 600,
		startY: 90,
		lineDash: [20, 5, 5, 5],
		order: myGroup.entitys.length,
	});

	scrawl.newPicture({
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
		roll: 10,
	});

	scrawl.newPhrase({
		method: 'fill',
		order: myGroup.entitys.length,
		text: 'No! Clone me! Me!',
		startX: 500,
		startY: 300,
		font: '20pt Arial, Helvetica',
	});

	//event listener
	handleEntity = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (currentObject) {
			currentObject.dropEntity();
			currentObject = null;
		}
		else {
			clickedObject = myGroup.getEntityAt(here);
			if (clickedObject) {
				currentObject = clickedObject.clone({
					order: myGroup.entitys.length,
				}).pickupEntity(here);
				if (currentObject.type === 'Block') {
					var newColor = myCol.clone({
						random: true,
					});
					currentObject.set({
						fillStyle: newColor.name,
					});
				}
			}
		}
	};
	myCanvas.addEventListener('mouseup', handleEntity, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			for (var i = 0, z = myGroup.entitys.length; i < z; i++) {
				if (scrawl.entity[myGroup.entitys[i]].type === 'Path') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						roll: 0.5,
					});
				}
				if (scrawl.entity[myGroup.entitys[i]].type === 'Block') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						lineDashOffset: (i % 2 === 0) ? 0.1 : -0.1,
					});
				}
				if (scrawl.entity[myGroup.entitys[i]].type === 'Wheel') {
					scrawl.entity[myGroup.entitys[i]].setDelta({
						roll: (i % 2 === 0) ? 0.2 : -0.2,
					});
				}
			}
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
		},
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
