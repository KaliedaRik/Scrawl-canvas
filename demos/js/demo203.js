var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myStack = scrawl.stack.mystack, //stack automatically created by canvas element
		clicked = false,
		harry,
		horace,
		cow,
		davey;

	//add stuff to the canvas, and display it
	scrawl.newPhrase({
		startX: 20,
		startY: 50,
		size: 20,
		text: 'Hi! I\'m the canvas.',
	});
	scrawl.render();

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
				startX: 300,
				startY: 5,
				width: 500,
			});
			horace.set({
				startX: 300,
				startY: 60,
				width: 500,
				deltaPitch: 1,
			});
			davey.set({
				width: 300,
				startX: 50,
				startY: 230,
				deltaYaw: 1,
			});
			cow.set({
				width: 200,
				height: 200,
				startX: 500,
				startY: 150,
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
			scrawl.update3d();
			scrawl.renderElements();

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
	modules: ['phrase', 'stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
