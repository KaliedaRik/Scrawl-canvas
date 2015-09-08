var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// Define variables
	var myPad = scrawl.pad.mystack_canvas,
		myPadEl = myPad.getElement(),
		myStack = scrawl.stack.mystack,
		myStackEl = myStack.getElement(),
		myElement = scrawl.element.myelement,
		myElementEl = myElement.getElement(),
		here = false,
		currentObject = false,
		clickedObject,
		myCol,
		myPadGroup = scrawl.group[myPad.base],
		myStackGroup = scrawl.group[myStack.name],
		pickupEntity,
		dropEntity;

	// Import images into scrawl library
	scrawl.getImagesByClass('demo219');

	// Initialize the DOM elements (the stack, canvas and div element used in the demo)
	myStack.set({
		width: 750,
		height: 375,
		perspectiveZ: 1000
	});

	// DOM stacking is critical to make this demo work - we give the Pad <canvas> element a separate stacking context,
	// lower than the Stack <div> element stacking context, to prevent it interfering with mouse/touch events
	myPad.set({
		translateZ: -1
	});

	// To enable drag/drop functionality on our element, we have to set both its interactive and drag attributes to true;
	// we use the CSS 'cursor' styling to ensure the correct cursor displays on mouse hover over the element
	myElement.set({
		fontSize: '24px',
		width: 240,
		height: 30,
		startX: 250,
		startY: 190,
		roll: 10,
		yaw: 50,
		interactive: true,
		drag: true,
		border: '2px solid blue',
		cursor: 'pointer'
	});

	// Define designs (gradients, colors)
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

	// Define animation sheets
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

	// Define entitys
	scrawl.makeRegularShape({
		name: 'C0_hello',
		startX: 420,
		startY: 100,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		method: 'fillDraw'
	});

	scrawl.makeRegularShape({
		startX: 520,
		startY: 230,
		angle: 90,
		radius: 35,
		fillStyle: 'green',
		strokeStyle: 'silver',
		lineWidth: 5,
		lineType: 't',
		shape: true,
		method: 'fillDraw'
	});

	scrawl.makePicture({
		source: 'angelfish',
		strokeStyle: 'Gold',
		lineWidth: 3,
		method: 'fillDraw',
		shadowBlur: 4,
		shadowColor: 'Black',
		startX: 120,
		startY: 20,
		scale: 0.3,
		scaleOutline: false
	});

	scrawl.makeBlock({
		strokeStyle: 'Orange',
		fillStyle: 'myBlue',
		lineWidth: 6,
		method: 'fillDraw',
		width: 100,
		height: 100,
		startX: 300,
		startY: 260,
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
	});

	scrawl.makeWheel({
		strokeStyle: 'yellow',
		fillStyle: 'blue',
		lineWidth: 6,
		method: 'fillDraw',
		startAngle: 50,
		endAngle: 120,
		includeCenter: true,
		radius: 30,
		startX: 630,
		startY: 220,
		checkHitUsingRadius: false,
	});

	scrawl.makePicture({
		startX: 100,
		startY: 300,
		pasteWidth: 120,
		pasteHeight: 66,
		method: 'fill',
		source: 'tiger',
		animation: 'mytiger',
		checkHitUsingImageData: true,
		handleX: 'center',
		handleY: 'center',
		flipReverse: true,
		roll: 10
	});

	scrawl.makePhrase({
		method: 'fill',
		text: 'No! Clone me! Me!',
		startX: 500,
		startY: 300,
		font: '20pt Arial, Helvetica'
	});

	scrawl.makeFrame({
		name: 'lockedSwan',
		lockFrameTo: 'mydiv1',
		source: 'swan',
		startX: 50,
		startY: 140,
		width: 120,
		height: 95,
		pitch: 20,
		yaw: 30,
		includeCornerTrackers: true
	});

	// Add entitys to the Stack's group (to simplify functionality)
	myStackGroup.addEntitysToGroup(myPadGroup.entitys);

	// Event listeners
	pickupEntity = function(e) {
		dropEntity(e);
		clickedObject = myStackGroup.getAt(here);
		if (clickedObject) {
			currentObject = clickedObject.pickupEntity(here);
		}
	};
	// Apply mouse and touch down events to the Pad and Element DOM elements
	scrawl.addListener('down', pickupEntity, [myPadEl, myElementEl]);

	dropEntity = function(e) {
		if (e) {
			e.preventDefault();
		}
		if (currentObject) {
			currentObject.dropEntity();
			currentObject = null;
		}
	};
	// Apply mouse and touch up/leave events only to the Stack DOM element
	scrawl.addListener(['up', 'leave'], dropEntity, [myStackEl]);

	// Stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.preventDefault();
		}
	}, [myPadEl, myElementEl, myStackEl]);

	// Animation object
	scrawl.makeAnimation({
		fn: function() {

			// Animate entitys
			for (var i = 0, z = myStackGroup.entitys.length; i < z; i++) {
				if (scrawl.entity[myStackGroup.entitys[i]].type === 'Path') {
					scrawl.entity[myStackGroup.entitys[i]].setDelta({
						roll: 0.5
					});
				}
				if (scrawl.entity[myStackGroup.entitys[i]].type === 'Block') {
					scrawl.entity[myStackGroup.entitys[i]].setDelta({
						lineDashOffset: (i % 2 === 0) ? 0.1 : -0.1
					});
				}
				if (scrawl.entity[myStackGroup.entitys[i]].type === 'Wheel') {
					scrawl.entity[myStackGroup.entitys[i]].setDelta({
						roll: -0.2
					});
				}
			}

			// Get current mouse/touch position
			here = myStack.getMouse();

			// If mouse/touch position is over an entity, change the Pad's canvas element's cursor to a pointer
			if (here.active) {
				myPadEl.style.cursor = (myStackGroup.getAt(here)) ? 'pointer' : 'auto';
			}

			// By default, entitys pivoted to the mouse (or touch) will use their Pad's mouse data for positioning;
			// we can override this functionality by including the Stack's mouse data as part of the render (or compile) call
			scrawl.render(null, here);

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		}
	});
};

// Initialization
scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	// A test to prevent multi-loading of extensions
	extensions: ['animation', 'color', 'factories', 'block', 'wheel', 'images', 'path', 'phrase', 'animation', 'color', 'factories', 'block', 'wheel', 'images', 'path', 'phrase', 'stacks', 'frame', 'shape'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
