var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//setup variables
	var myMessage = document.getElementById('message'),
		myPad = scrawl.pad.mycanvas,
		here,
		cellRotation = 0,
		myAngle,
		myArrow,
		report,
		mouse;

	//build entitys
	scrawl.makeLine({
		name: 'bgLine',
		startY: 187.5,
		endX: 750,
		endY: 187.5,
		method: 'draw',
		lineWidth: 3,
		strokeStyle: 'DarkGray',
	});

	myAngle = scrawl.makeWheel({
		name: 'angle',
		pivot: 'arrowCenter',
		radius: 20,
		startAngle: 0,
		endAngle: 0.001,
		order: 2,
		strokeStyle: 'Green',
		method: 'draw',
		closed: false,
	});

	scrawl.makeWheel({
		name: 'arrowCenter',
		startX: 375,
		startY: 187.5,
		radius: 5,
		fillStyle: 'Red',
		method: 'fillDraw',
		order: 3,
	});

	myArrow = scrawl.makePath({
		name: 'arrow',
		startX: 375,
		startY: 187.5,
		method: 'draw',
		line: true,
		order: 2,
		data: 'm0,0 -15-10 m0,20 15,-10 0,0',
	});
	scrawl.point.arrow_p5.setToFixed({
		x: 375,
		y: 187.5,
	});

	report = scrawl.makePhrase({
		name: 'msg',
		method: 'fill',
		text: 'Polar coordinates',
		pivot: 'arrowCenter',
		handleY: '110%',
		order: 4,
		font: '12pt Arial, Helvetica',
	});

	//animation function
	mouse = function(e) {
		var myA = here.x - 375,
			myO = here.y - 187.5,
			myH = Math.sqrt((myA * myA) + (myO * myO)),
			niceDistance,
			niceRotation,
			msgOrientation;
		cellRotation = Math.atan2(myO, myA) / scrawl.radian;
		myArrow.set({
			roll: cellRotation,
			mouseIndex: myPad.getMouseIdFromEvent(e)
		});
		myAngle.endAngle = cellRotation;
		myAngle.clockwise = (cellRotation > 0) ? false : true;
		niceDistance = Math.round(myH);
		niceRotation = Math.round(cellRotation * 100) / 100;
		msgOrientation = (scrawl.isBetween(cellRotation, -90, 90, true)) ? false : true;
		myMessage.innerHTML = 'Magnitude: ' + niceDistance + 'px; Angle: ' + niceRotation + '&deg;';
		report.set({
			text: 'M: ' + niceDistance + 'px; \u03B8: ' + niceRotation + '\u00B0',
			roll: cellRotation,
			flipUpend: msgOrientation,
			flipReverse: msgOrientation,
			handleX: (msgOrientation) ? '115%' : '-15%',
		});
	};

	//display initial scene; start animation
	scrawl.render();
	myArrow.pivot = 'mouse';


	//do animation via an event listener rather than an animation object
	scrawl.addListener(['down', 'move'], function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			here = myPad.getMouse();
			if (here.active) {
				mouse(e);
			}
		}
	}, scrawl.canvas.mycanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				scrawl.render();
			}
			else {
				myMessage.innerHTML = 'Move mouse over canvas';
			}

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
	modules: ['wheel', 'phrase', 'path', 'factories', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
