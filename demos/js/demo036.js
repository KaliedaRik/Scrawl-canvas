var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		here,
		mouseArrow = false;

	//define entitys
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
		scrawl.makePhrase({
			name: 'aPoint' + i,
			text: ' p' + i + ' ',
			pivot: 'arrow_p' + i,
			font: '12pt bold Arial, sans-serif',
			handleX: 'center',
		});
	}
	scrawl.entity.aPoint1.set({
		handleX: 'right'
	});
	scrawl.entity.aPoint4.set({
		handleX: 'left'
	});

	//display initial canvas
	scrawl.render();

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				scrawl.entity.arrow.set({
					pivot: 'mouse',
					roll: Math.atan2(here.y - 200, here.x - 200) / scrawl.radian,
				});
				scrawl.render();
			}
			else {
				scrawl.entity.arrow.set({
					pivot: false,
				});
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
	modules: ['animation', 'path', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
