var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// import images
	scrawl.getImagesByClass('demo218');

	//style the stack
	scrawl.stack.mystack.set({
		width: 600,
		height: 400,
		perspectiveZ: 800,
		border: '1px solid red'
	});

	//build entitys
	scrawl.makeFrame({
		name: 'lockedSwan',
		lockFrameTo: 'mydiv1',
		source: 'swan',
		startX: 50,
		startY: 50,
		width: 250,
		height: 175,
		pitch: 20,
		yaw: 30
	}).clone({
		lockFrameTo: 'mydiv2',
		startX: 350
	});

	scrawl.makeFrame({
		name: 'staticSwan',
		copyX: '15%',
		copyY: '15%',
		copyWidth: '70%',
		copyHeight: '70%',
		cornersData: [50, 250, 250, 250, 200, 350, 100, 350],
		source: 'swan'
	}).clone({
		cornersData: [350, 250, 550, 250, 500, 350, 400, 350]
	});

	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks', 'frame', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
