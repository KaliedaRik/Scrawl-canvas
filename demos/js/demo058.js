var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage'),
		myMessage = document.getElementById('message');

	//define variables
	var here,
		timeAtMouse = false,
		chaseMouse = false,
		biteDistance = 30,
		sleepDelay = 3200,
		myTiger,
		checkTiger,
		stopTiger,
		a;

	//convenience object for controlling animations
	a = {
		leftStand: 'tiger_leftStand',
		rightStand: 'tiger_rightStand',
		leftRun: 'tiger_leftRun',
		rightRun: 'tiger_rightRun',
		leftBite: 'tiger_leftBite',
		rightBite: 'tiger_rightBite',
		leftSleep: 'tiger_leftSleep',
		rightSleep: 'tiger_rightSleep',
		leftWake: 'tiger_leftWake',
		rightWake: 'tiger_rightWake',
		action: 'Stand',
		direction: 'left',
	};

	//import sprite sheet into scrawl library
	scrawl.getImagesByClass('demo058');

	//define sprite sheet objects - one for each animation sequence
	scrawl.newAnimSheet({
		name: 'tiger_leftStand',
		running: 'forward',
		loop: 'pause',
		frames: [{
			x: (120 * 0),
			y: (66 * 0),
			w: 120,
			h: 66,
			d: 0,
        }],
	}).clone({
		name: 'tiger_rightStand',
		frames: [{
			x: (120 * 0),
			y: (66 * 4),
			w: 120,
			h: 66,
			d: 0,
        }],
	}).clone({
		name: 'tiger_leftRun',
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
	}).clone({
		name: 'tiger_rightRun',
		frames: [{
			x: (120 * 0),
			y: (66 * 5),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 5),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 5),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 3),
			y: (66 * 5),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 4),
			y: (66 * 5),
			w: 120,
			h: 66,
			d: 100,
        }],
	}).clone({
		name: 'tiger_leftBite',
		frames: [{
			x: (120 * 0),
			y: (66 * 2),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 2),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 2),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 3),
			y: (66 * 2),
			w: 120,
			h: 66,
			d: 100,
        }, ],
	}).clone({
		name: 'tiger_rightBite',
		frames: [{
			x: (120 * 0),
			y: (66 * 6),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 6),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 6),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 3),
			y: (66 * 6),
			w: 120,
			h: 66,
			d: 100,
        }, ],
	}).clone({
		name: 'tiger_leftSleep',
		loop: 'end',
		frames: [{
			x: (120 * 0),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 1200,
        }, {
			x: (120 * 3),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 100,
        }, ],
	}).clone({
		name: 'tiger_rightSleep',
		frames: [{
			x: (120 * 0),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 1200,
        }, {
			x: (120 * 3),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 100,
        }, ],
	}).clone({
		name: 'tiger_leftWake',
		frames: [{
			x: (120 * 3),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 600,
        }, {
			x: (120 * 1),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 0),
			y: (66 * 3),
			w: 120,
			h: 66,
			d: 700,
        }, ],
	}).clone({
		name: 'tiger_rightWake',
		frames: [{
			x: (120 * 3),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 600,
        }, {
			x: (120 * 1),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 0),
			y: (66 * 7),
			w: 120,
			h: 66,
			d: 700,
        }, ],
	});

	//define sprite
	myTiger = scrawl.newPicture({
		name: 'tigerFrame',
		startX: 375,
		startY: 187,
		handleX: 'center',
		handleY: 'center',
		source: 'tiger',
		animSheet: a[a.direction + a.action],
	});

	//animation functions
	checkTiger = function() {
		var dx = myTiger.start.x - here.x,
			dy = myTiger.start.y - here.y;
		chaseMouse = (Math.sqrt((dx * dx) + (dy * dy)) > biteDistance) ? true : false;
		a.direction = (myTiger.start.x > here.x) ? 'left' : 'right';
		if (chaseMouse) {
			switch (a.action) {
				case 'Run':
					myTiger.set({
						animSheet: a[a.direction + a.action],
						startX: (dx > 0) ? myTiger.start.x - 1 : myTiger.start.x + 1,
						startY: (dy > 0) ? myTiger.start.y - 1 : myTiger.start.y + 1,
					});
					break;
				case 'Bite':
				case 'Stand':
					a.action = 'Run';
					myTiger.set({
						animSheet: a[a.direction + a.action],
						running: 'forward',
					});
					break;
				case 'Sleep':
					a.action = 'Wake';
					myTiger.set({
						animSheet: a[a.direction + a.action],
						running: 'forward',
					});
					break;
				case 'Wake':
					if (myTiger.get('running') === 'complete') {
						a.action = 'Run';
						myTiger.set({
							animSheet: a[a.direction + a.action],
							running: 'forward',
						});
					}
					break;
			}
			timeAtMouse = false;
		}
		else {
			if (!timeAtMouse || timeAtMouse + sleepDelay > Date.now()) {
				if (!timeAtMouse) {
					timeAtMouse = Date.now();
				}
				switch (a.action) {
					case 'Bite':
						myTiger.set({
							animSheet: a[a.direction + a.action],
						});
						break;
					default:
						a.action = 'Bite';
						myTiger.set({
							animSheet: a[a.direction + a.action],
							running: 'forward',
						});
				}
			}
			else {
				switch (a.action) {
					case 'Sleep':
						myTiger.set({
							animSheet: a[a.direction + a.action],
						});
						break;
					default:
						a.action = 'Sleep';
						myTiger.set({
							animSheet: a[a.direction + a.action],
							running: 'forward',
						});
						break;
				}
			}
		}
	};

	stopTiger = function() {
		a.action = 'Stand';
		myTiger.set({
			animSheet: a[a.direction + a.action],
		});
		chaseMouse = false;
		timeAtMouse = false;
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = scrawl.pad.mycanvas.getMouse();
			if (here.active) {
				checkTiger();
				myMessage.innerHTML = 'Current action: ' + a.action;
			}
			else {
				stopTiger();
				myMessage.innerHTML = 'Move mouse over canvas';
			}
			scrawl.render();

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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
