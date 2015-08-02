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
		mydiv = scrawl.element.mydiv,
		mycanvas = scrawl.pad.mystack_canvas,
		currentPitch = 0,
		currentYaw = 0,
		currentRoll = 0,
		currentPerspectiveX = 300,
		currentPerspectiveY = 200,
		currentPerspectiveZ = 1000,
		currentStartX = 300,
		currentStartY = 200,
		currentHandleX = 225,
		currentHandleY = 150,
		swan,
		events,
		stopE,
		here;

	// import images
	scrawl.getImagesByClass('demo217');

	//initialize sliders
	document.getElementById('pitch').value = 0;
	document.getElementById('yaw').value = 0;
	document.getElementById('roll').value = 0;
	document.getElementById('perspectiveX').value = 300;
	document.getElementById('perspectiveY').value = 200;
	document.getElementById('perspectiveZ').value = 1000;
	document.getElementById('startX').value = 300;
	document.getElementById('startY').value = 200;
	document.getElementById('handleX').value = 225;
	document.getElementById('handleY').value = 150;

	//style the stack
	mystack.set({
		width: 600,
		height: 400,
		perspectiveZ: 1000,
		border: '1px solid red'
	});
	mycanvas.set({
		translateZ: -1,
		border: '0'
	});

	//style the stack elements
	mydiv.set({
		startX: 300,
		startY: 200,
		handleX: 225,
		handleY: 150,
		width: 450,
		height: 300,
		border: '1px solid blue',
		padding: '10px',
		color: 'white',
		textShadow: '0 0 4px black',
		includeCornerTrackers: true
	});

	//build entity
	swan = scrawl.makePerspectiveCornersCell({
		name: 'swan',
		lockTo: 'mydiv',
		source: 'swan'
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
				swan.redraw = true;
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
				mydiv.set(items);
				swan.redraw = true;
			}
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks', 'perspective', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
