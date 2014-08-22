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
	});
	scrawl.addNewCell({
		name: 'paper',
	});
	scrawl.setDrawOrder(['paper', 'struts']);

	//define designs (color)
	myCol = scrawl.newColor({
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

	//define sprites
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
	scrawl.newWheel({
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

	scrawl.newWheel({
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
		scrawl.sprite.strutOne.setDelta({
			roll: s1rotate,
		});
		scrawl.sprite.strutTwo.setDelta({
			roll: s2rotate,
		});
		if (scrawl.sprite.strutOne.roll > 360) {
			currentScale = scrawl.sprite.strutOne.get('scale');
			scrawl.sprite.strutOne.roll -= 360;
			if (!scrawl.isBetween((currentScale + s1scale), 0.3, 1, true)) {
				s1scale = -s1scale;
			}
			scrawl.sprite.strutOne.setDelta({
				scale: s1scale,
			});
			scrawl.sprite.strutOne.set({
				lineWidth: (1 / currentScale) * 2,
			});
			myCol.update();
		}
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveStruts();
			scrawl.render({
				clear: ['struts', 'mycanvas_base'],
			});

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
