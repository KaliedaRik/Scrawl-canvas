var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var bgOff = scrawl.makeColor({
			name: 'backgroundOff',
			color: 'peachpuff'
		}),
		bgOn = scrawl.makeColor({
			name: 'backgroundOn',
			color: 'peru'
		});

	//define entity
	scrawl.makeEllipse({
		name: 'ellie',
		startX: 200,
		startY: 200,
		radiusX: 150,
		radiusY: 50,
		lineWidth: 5,
		fillStyle: scrawl.makeColor({
			color: 'indigo'
		}).name,
		strokeStyle: scrawl.makeColor({
			color: 'firebrick'
		}).name,
		method: 'fillDraw',
		shape: true,
	});

	//stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}, scrawl.canvas.mycanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			scrawl.entity.ellie.setDelta({
				roll: 1,
			});
			scrawl.cell.mycanvas_base.set({
				backgroundColor: (scrawl.entity.ellie.checkHit(scrawl.pad.mycanvas.getMouse())) ? bgOn.get() : bgOff.get()
			});
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['shape', 'factories', 'animation', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
