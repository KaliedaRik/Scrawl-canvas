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
		myWheels;

	//setup canvas
	scrawl.canvas.mycanvas.style.cursor = 'crosshair';

	//define entity
	scrawl.makeGradient({
		name: 'gradient',
		shift: 0.002,
		autoUpdate: true,
		lockTo: true,
		color: [{
			color: '#333333',
			stop: 0
        }, {
			color: 'orange',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'green',
			stop: 0.6
        }, {
			color: '#cccccc',
			stop: 0.8
        }, {
			color: '#333333',
			stop: 1
        }, ],
	});

	myWheels = scrawl.makeGroup({
		name: 'wheels'
	});

	for (var i = 0; i < 10; i++) {
		scrawl.makeWheel({
			strokeStyle: 'Red',
			fillStyle: 'gradient',
			radius: 100,
			lineWidth: 4,
			pivot: 'mouse',
			method: 'fillDraw',
			order: i,
			name: 'orb' + i,
			group: 'wheels',
			visibility: false
		});
	}

	//event listeners
	scrawl.addListener(['down', 'move'], function(e) {
		var here, j, jz;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			here = myPad.getMouse(e);
			for (j = 0, jz = here.length; j < jz; j++) {
				if (here[j].active) {
					scrawl.entity['orb' + j].set({
						mouseIndex: here[j].id,
						visibility: true
					});
				}
				else {
					scrawl.entity['orb' + j].set({
						mouseIndex: '',
						visibility: false
					});
				}
			}
		}
	}, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], function(e) {
		var here, i, iz, j, jz, orbs;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			here = myPad.getMouse(e);
			for (j = 0, jz = here.length; j < jz; j++) {
				orbs = myWheels.getEntitysByMouseIndex(here[j].id);
				for (i = 0, iz = orbs.length; i < iz; i++) {
					orbs[i].set({
						mouseIndex: '',
						visibility: false
					});
				}
			}
		}
	}, scrawl.canvas.mycanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {

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
	modules: ['animation', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
