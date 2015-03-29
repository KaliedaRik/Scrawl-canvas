var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var here,
		myGroup,
		balls,
		bendy,
		getWheel,
		dropWheel,
		stopE,
		myEntity = false;

	//define groups
	myGroup = scrawl.makeGroup({
		name: 'mygroup',
	});
	balls = scrawl.makeGroup({
		name: 'balls',
	});

	//define entitys
	for (var i = 0; i < 3; i++) {
		scrawl.makeWheel({
			name: 'wheel_' + i,
			radius: 10,
			fillStyle: 'blue',
			method: 'fillDraw',
			startY: 200,
			startX: 250 * (i + 1) - 125,
			order: 1,
			group: 'mygroup',
		});
	}

	bendy = scrawl.makeQuadratic({
		name: 'mycurve',
		lineWidth: 5,
		strokeStyle: 'red',
		method: 'draw',
		precision: 100,
	});
	//fix curve points to their draggable handles
	scrawl.point.mycurve_p1.setToFixed('wheel_0');
	scrawl.point.mycurve_p2.setToFixed('wheel_1');
	scrawl.point.mycurve_p3.setToFixed('wheel_2');

	scrawl.makePhrase({
		font: '12pt Arial, sans-serif',
		handleX: 'center',
		handleY: 30,
		text: 'start',
		pivot: 'wheel_0',
		order: 2,
	}).clone({
		text: 'control',
		pivot: 'wheel_1',
	}).clone({
		text: 'end',
		pivot: 'wheel_2',
	});

	scrawl.makeWheel({
		name: 'goldwheel',
		radius: 10,
		fillStyle: 'gold',
		method: 'fillDraw',
		order: 1,
		group: 'balls',
		path: 'mycurve',
		pathSpeedConstant: false,
	}).clone({
		name: 'pinkwheel',
		radius: 8,
		fillStyle: 'pink',
		order: 2,
		pathSpeedConstant: true,
	});

	//event listeners
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	getWheel = function(e) {
		stopE(e);
		here = scrawl.pad.mycanvas.getMouse();
		myEntity = myGroup.getEntityAt(here);
		if (myEntity) {
			myEntity.pickupEntity(here);
		}
	};
	dropWheel = function(e) {
		stopE(e);
		if (myEntity) {
			myEntity.dropEntity();
			myEntity = false;
			bendy.buildPositions();
		}
	};
	scrawl.addListener('down', getWheel, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], dropWheel, scrawl.canvas.mycanvas);

	//tweens
	scrawl.makeTween({
		name: 'goldTween',
		targets: scrawl.entity.goldwheel,
		start: {
			pathPlace: 0
		},
		end: {
			pathPlace: 1
		},
		duration: 10000,
		count: true
	}).run();
	scrawl.animation.goldTween.clone({
		name: 'pinkTween',
		targets: scrawl.entity.pinkwheel
	}).run();

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			//update curve
			if (myEntity) {
				bendy.buildPositions();
			}

			//update canvas display
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + parseInt(testTime, 10) + '; fps: ' + parseInt(1000 / testTime, 10);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'wheel', 'phrase', 'factories', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
