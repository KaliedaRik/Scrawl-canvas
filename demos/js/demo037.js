var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var myPad = scrawl.pad.mycanvas,
		backgroundCell,
		magnifierCell,
		backgroundEntity,
		magnifierEntity,
		stencilEntity,
		here;

	scrawl.getImagesByClass('demo037');

	backgroundCell = myPad.addNewCell({
		name: 'background',
		//restrict this cell's activity within the display cycle
		cleared: false,
		compiled: false,
		showOrder: 1,
	});
	backgroundEntity = scrawl.makePicture({
		name: 'miniscene',
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
	backgroundCell.compile();

	magnifierCell = myPad.addNewCell({
		name: 'magnifier',
		height: 140,
		width: 140,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		//take the cell out of the display cycle
		rendered: false,
		showOrder: 2,
	});
	magnifierEntity = scrawl.makePicture({
		name: 'magnifier',
		source: 'river',
		method: 'fill',
		group: 'magnifier',
		globalCompositeOperation: 'source-in',
		width: 140,
		height: 140,
		copyWidth: 140,
		copyHeight: 140,
	});
	stencilEntity = scrawl.makeWheel({
		name: 'stencil',
		startX: 70,
		startY: 70,
		radius: 69,
		lineWidth: 1,
		strokeStyle: 'Red',
		group: 'magnifier',
	});

	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();
			//only render the magnifier cell when the mouse is over the canvas
			magnifierCell.set({
				rendered: (here.active) ? true : false,
			});
			//split the display cycle into its clear, compile/stamp and show components
			myPad.clear();
			if (here.active) {
				magnifierEntity.set({
					copyX: (here.x * 5) + 10,
					copyY: (here.y * 5) + 650,
				});
				stencilEntity.stamp('fill');
				magnifierEntity.stamp();
				stencilEntity.stamp('draw');
			}
			myPad.show();

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
