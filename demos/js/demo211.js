var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var mystack = scrawl.stack.mystack,
		elstk = scrawl.stk.mystack,
		mycanvas = scrawl.pad.mycanvas,
		temp = scrawl.canvas.mycanvas,
		currentPitch = 0,
		currentYaw = 0,
		currentRoll = 0,
		currentPerspectiveX = 300,
		currentPerspectiveY = 200,
		currentPerspectiveZ = 1000,
		currentStartX = 300,
		currentStartY = 200,
		currentHandleX = 300,
		currentHandleY = 200,
		wheel,
		events,
		stopE,
		here;

	//initialize sliders
	document.getElementById('pitch').value = 0;
	document.getElementById('yaw').value = 0;
	document.getElementById('roll').value = 0;
	document.getElementById('perspectiveX').value = 300;
	document.getElementById('perspectiveY').value = 200;
	document.getElementById('perspectiveZ').value = 1000;
	document.getElementById('startX').value = 300;
	document.getElementById('startY').value = 200;
	document.getElementById('handleX').value = 300;
	document.getElementById('handleY').value = 200;

	//style the stack
	mystack.set({
		width: 600,
		height: 400,
		perspectiveZ: 1000,
		border: '1px solid red'
	});

	//style the stack elements
	mycanvas.set({
		startX: 300,
		startY: 200,
		handleX: 300,
		handleY: 200
	});

	//build entity
	wheel = scrawl.makeWheel({
		name: 'mywheel',
		radius: 70,
		fillStyle: 'blue',
		strokeStyle: 'red',
		lineWidth: 10,
		method: 'fillDraw',
		pivot: 'mouse',
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	events = function(e) {
		var items = {},
			temp;
		stopE(e);
		if (scrawl.contains(['perspectiveX', 'perspectiveY', 'perspectiveZ'], e.target.id)) {
			switch (e.target.id) {
				case 'perspectiveX':
					currentPerspectiveX = Math.round(e.target.value);
					break;
				case 'perspectiveY':
					currentPerspectiveY = Math.round(e.target.value);
					break;
				case 'perspectiveZ':
					currentPerspectiveZ = Math.round(e.target.value);
					break;
				default:
					items = false;
			}
			if (items) {
				items.perspectiveX = currentPerspectiveX;
				items.perspectiveY = currentPerspectiveY;
				items.perspectiveZ = currentPerspectiveZ;
				mystack.set(items);
			}
		}
		else {
			switch (e.target.id) {
				case 'pitch':
					currentPitch = Math.round(e.target.value);
					break;
				case 'yaw':
					currentYaw = Math.round(e.target.value);
					break;
				case 'roll':
					currentRoll = Math.round(e.target.value);
					break;
				case 'startX':
					currentStartX = Math.round(e.target.value);
					break;
				case 'startY':
					currentStartY = Math.round(e.target.value);
					break;
				case 'handleX':
					currentHandleX = Math.round(e.target.value);
					break;
				case 'handleY':
					currentHandleY = Math.round(e.target.value);
					break;
				default:
					items = false;
			}
			if (items) {
				items.pitch = currentPitch;
				items.yaw = currentYaw;
				items.roll = currentRoll;
				items.startX = currentStartX;
				items.startY = currentStartY;
				items.handleX = currentHandleX;
				items.handleY = currentHandleY;
				mycanvas.set(items);
			}
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//stop touchmove dragging the page up/down
	scrawl.addListener(['move', 'down'], function(e) {
		stopE(e);
		here = mycanvas.getMouse();
		wheel.mouseIndex = here.id;
	}, scrawl.canvas.mycanvas);

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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['animation', 'stacks', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
