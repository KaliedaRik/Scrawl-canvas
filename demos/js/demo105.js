var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define Path entity
	scrawl.makePath({
		name: 'track',
		data: 'm-150-150 100,0 100,100 100,0 0,-50 -50,-50 -150,100 -100,0',
		lineWidth: 10,
		handleX: 'center',
		handleY: 'center',
		isLine: false,
		startX: 200,
		startY: 200,
		markStart: 'circle',
		markEnd: 'arrow',
		mark: 'diamond',
		precision: 1,
	});

	//define mark entitys
	scrawl.makeWheel({
		name: 'circle',
		visibility: false,
		fillStyle: 'red',
		strokeStyle: 'blue',
		method: 'fillDraw',
		radius: 15,
	});
	scrawl.makeBlock({
		name: 'diamond',
		visibility: false,
		width: 20,
		height: 20,
		handleX: 'center',
		handleY: 'center',
		roll: 45,
		fillStyle: 'gold',
		strokeStyle: 'blue',
		method: 'fillDraw',
		lineWidth: 2,
		globalAlpha: 0.8,
	});
	scrawl.makeShape({
		name: 'arrow',
		visibility: false,
		data: 'l0,0 40,15 -40,15 0-30z',
		handleX: 'left',
		handleY: 'center',
		method: 'fill',
		addPathRoll: true,
	});

	//convert Path (with markers) to Picture
	scrawl.entity.track.convertToPicture({
		name: 'pictureTrack',
		handleX: 'center',
		handleY: 'center',
		startX: 200,
		startY: 100,
		roll: 180,
		convert: true,
		method: 'fillDraw',
		lineWidth: 2,
		callback: function() {
			scrawl.render();
		},
	});

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'path', 'shape', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
