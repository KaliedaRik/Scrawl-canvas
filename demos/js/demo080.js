var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myCol,
		s1rotate = 0.5,
		s2rotate = -1,
		s1scale = 0.05,
		currentScale;

	//define cells
	scrawl.addNewCell({
		name: 'struts',
		showOrder: 2,
	});
	scrawl.addNewCell({
		name: 'paper',
		showOrder: 1,
		cleared: false,
	});

	//define designs (color)
	myCol = scrawl.makeColor({
		name: 'myCol',
		random: true,
		a: 1,
		rMax: 200,
		gMax: 200,
		bMax: 200,
		rBounce: true,
		gBounce: true,
		bBounce: true,
		rShift: 7,
		gShift: 6,
		bShift: 5,
	});

	//define entitys
	scrawl.makeLine({
		name: 'strutOne',
		startX: 200,
		startY: 200,
		endX: 300,
		endY: 200,
		lineWidth: 2,
		method: 'draw',
		fixed: 'start',
		group: 'struts',
	});
	scrawl.makeLine({
		name: 'strutTwo',
		endX: 375,
		endY: 200,
		startX: 300,
		startY: 200,
		lineWidth: 2,
		method: 'draw',
		group: 'struts',
		pivot: 'strutOne_p2',
	});
	scrawl.makeWheel({
		pivot: 'strutOne_p1',
		radius: 5,
		method: 'fillDraw',
		fillStyle: 'red',
		group: 'struts',
		order: 1,
	}).clone({
		pivot: 'strutOne_p2',
	}).clone({
		radius: 3,
		pivot: 'strutTwo_p2',
	});
	scrawl.cell.struts.compile();

	scrawl.makeWheel({
		name: 'pen',
		pivot: 'strutTwo_p2',
		radius: 1,
		method: 'fill',
		fillStyle: 'myCol',
		group: 'paper',
		order: 0,
	});

	//define animation functions
	var moveStruts = function() {
		scrawl.entity.strutOne.setDelta({
			roll: s1rotate,
		});
		scrawl.entity.strutTwo.setDelta({
			roll: s2rotate,
		});
		if (scrawl.entity.strutOne.roll > 360) {
			currentScale = scrawl.entity.strutOne.get('scale');
			scrawl.entity.strutOne.roll -= 360;
			if (!scrawl.isBetween((currentScale + s1scale), 0.3, 1, true)) {
				s1scale = -s1scale;
			}
			scrawl.entity.strutOne.setDelta({
				scale: s1scale,
			});
			scrawl.entity.strutOne.set({
				lineWidth: (1 / currentScale) * 2,
			});
			myCol.update();
		}
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			moveStruts();
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
	modules: ['color', 'path', 'factories', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
