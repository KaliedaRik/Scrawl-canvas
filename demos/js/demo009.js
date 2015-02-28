var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var here,
		myEntity = false,
		myGroup,
		doLines,
		getWheel,
		dropWheel,
		stopE,
		myPos = 0,
		dPos = 0.005,
		length,
		lengthText = document.getElementById('curveLength');

	myGroup = scrawl.newGroup({
		name: 'mygroup',
	});
	for (var i = 0; i < 4; i++) {
		scrawl.newWheel({
			name: 'wheel_' + i,
			radius: 10,
			fillStyle: 'blue',
			method: 'fillDraw',
			startY: 200,
			startX: 150 * (i + 1),
			order: 1,
			group: 'mygroup',
		});
	}

	scrawl.makeBezier({
		name: 'mycurve',
		lineWidth: 5,
		strokeStyle: 'red',
		method: 'draw',
		precision: 100,
	});
	scrawl.point.mycurve_p1.setToFixed('wheel_0');
	scrawl.point.mycurve_p2.setToFixed('wheel_1');
	scrawl.point.mycurve_p3.setToFixed('wheel_2');
	scrawl.point.mycurve_p4.setToFixed('wheel_3');

	scrawl.makeLine({
		name: 'startline',
		strokeStyle: 'green',
	}).clone({
		name: 'midline',
	}).clone({
		name: 'endline',
	}).clone({
		name: 'startMid',
		strokeStyle: 'black',
		lineWidth: 2,
		fixed: 'both',
	}).clone({
		name: 'midEnd',
		fixed: 'both',
	}).clone({
		name: 'startMidEnd',
		strokeStyle: 'orange',
		lineWidth: 3,
		fixed: 'both',
	});
	scrawl.point.startline_p1.setToFixed('wheel_0');
	scrawl.point.startline_p2.setToFixed('wheel_1');
	scrawl.point.midline_p1.setToFixed('wheel_1');
	scrawl.point.midline_p2.setToFixed('wheel_2');
	scrawl.point.endline_p1.setToFixed('wheel_2');
	scrawl.point.endline_p2.setToFixed('wheel_3');

	scrawl.newPhrase({
		font: '12pt Arial, sans-serif',
		handleX: 'center',
		handleY: 30,
		text: 'start',
		pivot: 'wheel_0',
		order: 2,
	}).clone({
		text: 'startControl',
		pivot: 'wheel_1',
	}).clone({
		text: 'endControl',
		pivot: 'wheel_2',
	}).clone({
		text: 'end',
		pivot: 'wheel_3',
	});

	scrawl.newWheel({
		name: 'goldwheel',
		radius: 10,
		fillStyle: 'gold',
		method: 'fillDraw',
		order: 1,
	});

	doLines = function(pos) {
		var startlinePos,
			midlinePos,
			endlinePos,
			startMidPos,
			midEndPos,
			startMidEndPos;
		startlinePos = scrawl.entity.startline.getPerimeterPosition(pos, false);
		scrawl.point.startMid_p1.local.set(startlinePos);
		midlinePos = scrawl.entity.midline.getPerimeterPosition(pos, false);
		scrawl.point.startMid_p2.local.set(midlinePos);
		scrawl.point.midEnd_p1.local.set(midlinePos);
		endlinePos = scrawl.entity.endline.getPerimeterPosition(pos, false);
		scrawl.point.midEnd_p2.local.set(endlinePos);
		startMidPos = scrawl.entity.startMid.getPerimeterPosition(pos, false);
		scrawl.point.startMidEnd_p1.local.set(startMidPos);
		midEndPos = scrawl.entity.midEnd.getPerimeterPosition(pos, false);
		scrawl.point.startMidEnd_p2.local.set(midEndPos);
		startMidEndPos = scrawl.entity.startMidEnd.getPerimeterPosition(pos, false);
		scrawl.entity.goldwheel.start.set(startMidEndPos);
	};

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
		}
	};
	scrawl.addListener('down', getWheel, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], dropWheel, scrawl.canvas.mycanvas);

	length = scrawl.entity.mycurve.getPerimeterLength(true);

	//animation object
	scrawl.newAnimation({
		fn: function() {
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
