var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var myPad = scrawl.pad.mycanvas,
		magnifierCell,
		magnifierEntity;

	scrawl.getImagesByClass('demo037');

	// background
	myPad.addNewCell({
		name: 'background',
		showOrder: 1,
	});
	scrawl.makePicture({
		name: 'scene',
		source: 'river',
		method: 'fill',
		group: 'background',
		width: 750,
		height: 375,
		copyX: 60,
		copyY: 700,
		copyWidth: 3750,
		copyHeight: 1875,
	});

	// magnifier
	magnifierCell = myPad.addNewCell({
		name: 'magnifier',
		height: 140,
		width: 140,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		rendered: false,
		showOrder: 2,
	});
	magnifierEntity = scrawl.makePicture({
		name: 'sceneclip',
		source: 'river',
		method: 'fill',
		group: 'magnifier',
		globalCompositeOperation: 'source-in',
		width: 140,
		height: 140,
		copyWidth: 140,
		copyHeight: 140,
		order: 1,
	});
	scrawl.makeWheel({
		name: 'stencil',
		startX: 70,
		startY: 70,
		radius: 69,
		method: 'fill',
		order: 0,
		group: 'magnifier',
	}).clone({
		name: 'outline',
		lineWidth: 1,
		strokeStyle: 'Red',
		method: 'draw',
		order: 2,
	});

	//event listeners
	scrawl.addListener(['down', 'move'], function(e) {
		var here;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			here = myPad.getMouse();
			if (here.active) {
				magnifierCell.set({
					rendered: true,
					mouseIndex: myPad.getMouseIdFromEvent(e)
				});
				magnifierEntity.set({
					copyX: (here.x * 5) + 10,
					copyY: (here.y * 5) + 650,
				});
			}
			else {
				magnifierCell.rendered = false;
			}
		}
	}, scrawl.canvas.mycanvas);
	scrawl.addListener('leave', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			magnifierCell.rendered = false;
		}
	}, scrawl.canvas.mycanvas);

	scrawl.makeAnimation({
		fn: function() {

			myPad.render();

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
	modules: ['animation', 'images', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
