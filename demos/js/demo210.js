var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var stack,
		buttons = [],
		moveButton,
		i;

	//add stack to web page
	stack = scrawl.addStackToPage({
		stackName: 'stack',
		parentElement: document.getElementById('stackHolder'),
		width: 600,
		height: 240,
		perspectiveZ: 400,
	});

	//get DOM buttons and add them to the stack
	stack.addElementsByClassName('mybuttons');
	buttons.push(scrawl.element.button0);
	buttons.push(scrawl.element.button1);
	buttons.push(scrawl.element.button2);
	buttons.push(scrawl.element.button3);

	//position and size buttons
	for (i = 0; i < 4; i++) {
		buttons[i].set({
			startX: 30,
			startY: (i * 50) + 20,
			width: 100,
			height: 40,
		});
	}
	scrawl.renderElements();

	scrawl.newTween({
		name: 'button0',
		targets: buttons,
		start: {
			startX: 30,
			roll: 0,
		},
		engines: {
			startX: 'easeOutIn3',
			roll: 'easeOutIn3',
		},
		end: {
			startX: 500,
			roll: 360,
		},
		onComplete: {
			startX: 30,
			roll: 0,
		},
		duration: 3000,
		count: 2,
		autoReverseAndRun: true,
	}).clone({
		name: 'button1',
		targets: scrawl.element.button1,
		onCommence: {
			fontSize: '120%',
			color: 'red',
		},
		onComplete: {
			startX: 30,
			roll: 0,
			fontSize: '100%',
			color: 'black',
		},
		engines: {
			startX: 'easeIn5',
			roll: 'easeOut5',
		},
	}).clone({
		name: 'button2',
		targets: scrawl.element.button2,
		onCommence: {},
		start: {
			startX: 30,
			height: 40,
		},
		end: {
			startX: 500,
			height: 100,
		},
		onComplete: {
			startX: 30,
			height: 40,
		},
		engines: {
			startX: 'easeIn3',
			height: 'easeIn3',
		},
		duration: 2000,
	}).clone({
		name: 'button3',
		targets: [scrawl.element.button1, buttons[3]],
		start: {
			startX: 30,
			roll: 0,
			pitch: 0,
			yaw: 0,
		},
		end: {
			startX: 500,
			roll: 360,
			pitch: 360,
			yaw: 360,
		},
		onComplete: {
			startX: 30,
			roll: 0,
			pitch: 0,
			yaw: 0,
		},
		engines: {
			startX: 'easeOutIn3',
			roll: 'easeOut4',
			pitch: 'in',
			yaw: 'out',
		},
		duration: 4000,
	});

	//button event listeners
	moveButton = function(e) {
		e.preventDefault();
		e.returnValue = false;
		scrawl.animation[e.target.id].run();
	};
	for (i = 0; i < 4; i++) {
		scrawl.elm[buttons[i].name].addEventListener('click', moveButton, false);
	}

	//animation object
	scrawl.newAnimation({
		fn: function() {
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
	modules: ['animation', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
