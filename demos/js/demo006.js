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
		myEntity = false,
		myPos = 0,
		dPos = 0.005,
		length,
		lengthText = document.getElementById('curveLength'),
		doLines,
		getWheel,
		dropWheel;

	//define groups
	scrawl.newGroup({
		name: 'mygroup',
	});

	//define entitys
	for (var i = 0; i < 3; i++) {
		scrawl.newWheel({
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
	scrawl.makeQuadratic({
		name: 'mycurve',
		lineWidth: 5,
		strokeStyle: 'red',
		method: 'draw',
		precision: 100,
	});
	scrawl.point.mycurve_p1.setToFixed('wheel_0');
	scrawl.point.mycurve_p2.setToFixed('wheel_1');
	scrawl.point.mycurve_p3.setToFixed('wheel_2');

	scrawl.makeLine({
		name: 'startline',
		strokeStyle: 'green',
	}).clone({
		name: 'endline',
	}).clone({
		name: 'startMidEnd',
		strokeStyle: 'orange',
		lineWidth: 2,
	});
	scrawl.point.startline_p1.setToFixed('wheel_0');
	scrawl.point.startline_p2.setToFixed('wheel_1');
	scrawl.point.endline_p1.setToFixed('wheel_1');
	scrawl.point.endline_p2.setToFixed('wheel_2');
	scrawl.point.startMidEnd_p1.setToFixed(true);
	scrawl.point.startMidEnd_p2.setToFixed(true);

	scrawl.newPhrase({
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

	scrawl.newWheel({
		name: 'goldwheel',
		radius: 10,
		fillStyle: 'gold',
		method: 'fillDraw',
		order: 1,
	});

	//entity animation function
	doLines = function(pos) {
		var startlinePos,
			endlinePos,
			startMidEndPos;
		startlinePos = scrawl.entity.startline.getPerimeterPosition(pos, false);
		scrawl.point.startMidEnd_p1.local.set(startlinePos);
		endlinePos = scrawl.entity.endline.getPerimeterPosition(pos, false);
		scrawl.point.startMidEnd_p2.local.set(endlinePos);
		startMidEndPos = scrawl.entity.startMidEnd.getPerimeterPosition(pos, false);
		scrawl.entity.goldwheel.start.set(startMidEndPos);
	};

	//event listeners
	getWheel = function(e) {
		myEntity = scrawl.group.mygroup.getEntityAt(here);
		if (myEntity) {
			myEntity.pickupEntity(here);
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	dropWheel = function(e) {
		if (myEntity) {
			myEntity.dropEntity();
			myEntity = false;
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	scrawl.canvas.mycanvas.addEventListener('mousedown', getWheel, false);
	scrawl.canvas.mycanvas.addEventListener('mouseup', dropWheel, false);

	length = scrawl.entity.mycurve.getPerimeterLength(true);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = scrawl.pad.mycanvas.getMouse();
			if (!here.active && myEntity) {
				dropWheel();
			}
			if (myEntity) {
				length = scrawl.entity.mycurve.getPerimeterLength(true);
			}
			myPos = (myPos + dPos > 1) ? 0 : myPos + dPos;
			doLines(myPos);
			lengthText.innerHTML = parseInt(length, 10);

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
	modules: ['path', 'wheel', 'factories', 'animation', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
