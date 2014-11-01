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
		here,
		mouse;

	scrawl.getImagesByClass('demo037');

	backgroundCell = myPad.addNewCell({
		name: 'background',
	});
	magnifierCell = myPad.addNewCell({
		name: 'magnifier',
		height: 140,
		width: 140,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
	});

	backgroundEntity = scrawl.newPicture({
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
	magnifierEntity = scrawl.newPicture({
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
	stencilEntity = scrawl.newWheel({
		name: 'stencil',
		startX: 70,
		startY: 70,
		radius: 69,
		lineWidth: 1,
		strokeStyle: 'Red',
		group: 'magnifier',
	});

	backgroundEntity.stamp();
	myPad.setDrawOrder(['background']);
	myPad.show();

	mouse = function() {
		magnifierEntity.set({
			copyX: (here.x * 5) + 10,
			copyY: (here.y * 5) + 650,
		});
		myPad.clear(['magnifier']);
		stencilEntity.stamp('fill');
		magnifierEntity.stamp();
		stencilEntity.stamp('draw');
		myPad.setDrawOrder(['background', 'magnifier']);
		myPad.show();
	};

	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				mouse();
			}
			else {
				myPad.setDrawOrder(['background']);
				myPad.show();
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
	modules: ['animation', 'images', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
