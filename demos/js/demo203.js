var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myStack = scrawl.stack.mystack, //stack automatically created by canvas element
		clicked = false,
		harry,
		horace,
		cow,
		davey;

	//add stuff to the canvas
	scrawl.newPhrase({
		startX: 20,
		startY: 50,
		size: 20,
		text: 'Hi! I\'m the canvas.',
	});

	//event listener
	function moveIn(e) {
		if (!clicked) {
			//ensure listener only runs once
			clicked = true;

			//setup stack for 3d animations
			myStack.set({
				width: 800,
				height: 400,
				perspectiveZ: 1000,
			});

			//add DOM elements to the scrawl library
			myStack.addElementById('horace');
			myStack.addElementsByClassName('inwego');

			//assign elements to previously defined variables
			harry = scrawl.element.harry;
			horace = scrawl.element.horace;
			cow = scrawl.element.cow;
			davey = scrawl.element.davey;

			//modify DOM elements - position and dimensions within stack; rotations
			harry.set({
				startX: 302,
				width: 486,
			});
			horace.set({
				startX: 'center',
				startY: 'center',
				handleX: 80,
				handleY: 140,
				width: '50%',
				deltaPitch: 1,
			});
			davey.set({
				width: '25%',
				startX: 50,
				startY: 230,
				deltaYaw: 1,
			});
			cow.set({
				width: '25%',
				height: '50%',
				handle: {
					x: 'center',
					y: 'center'
				},
				start: {
					x: '80%',
					y: '65%'
				},
				deltaRoll: 1,
			});
		}
		scrawl.animation.myanim.run();
	}
	document.addEventListener('mouseup', moveIn, false);

	//animation object
	scrawl.newAnimation({
		name: 'myanim',
		delay: true,
		fn: function() {
			scrawl.update();
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
	modules: ['phrase', 'stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
