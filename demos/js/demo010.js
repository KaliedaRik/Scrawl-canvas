var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define entitys
	scrawl.makeWheel({
		name: 'mywheel',
		startX: 100,
		startY: 100,
		radius: 80,
		fillStyle: 'Gold',
		strokeStyle: 'rgb(0,190,0)',
		lineWidth: 10,
		lineCap: 'round',
		lineJoin: 'round',
		shadowOffsetX: 3,
		shadowOffsetY: 3,
		shadowBlur: 2,
		shadowColor: 'Black',
		method: 'sinkInto',
	}).clone({
		startX: 300,
		startAngle: 30,
		endAngle: 325,
		includeCenter: true,
		scale: 0.7,
	});

	//display canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'wheel',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
