var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myPad = scrawl.pad.mycanvas,
		here,
		mouseArrow = false;

	//define sprites
	scrawl.makePath({
		name: 'arrow',
		startX: 200,
		startY: 200,
		lineWidth: 6,
		strokeStyle: 'red',
		method: 'draw',
		lineJoin: 'round',
		lineCap: 'round',
		line: true,
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 2,
		shadowColor: 'black',
		data: 'm0,0 -50-40 m0,80 50-40 0,0',
	});
	scrawl.point.arrow_p5.setToFixed({
		x: 200,
		y: 200,
	});

	for (var i = 1; i < 6; i++) {
		scrawl.newPhrase({
			name: 'aPoint' + i,
			text: ' p' + i + ' ',
			pivot: 'arrow_p' + i,
			font: '12pt bold Arial, sans-serif',
			handleX: 'center',
		});
	}
	scrawl.sprite.aPoint1.set({
		handleX: 'right'
	});
	scrawl.sprite.aPoint4.set({
		handleX: 'left'
	});

	//display initial canvas
	scrawl.render();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				scrawl.sprite.arrow.set({
					pivot: 'mouse',
					roll: Math.atan2(here.y - 200, here.x - 200) / scrawl.radian,
				});
				scrawl.render();
			}
			else {
				scrawl.sprite.arrow.set({
					pivot: false,
				});
			}

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
	modules: ['animation', 'path', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
