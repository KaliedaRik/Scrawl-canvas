var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define entitys - include styling attributes in the definition
	scrawl.makeRegularShape({
		startX: 200,
		startY: 100,
		radius: 90,
		sides: 5,
		roll: -18,
		fillStyle: 'Pink',
		strokeStyle: 'Purple',
		method: 'sinkInto',
		lineWidth: 10,
		lineJoin: 'round',
		shadowBlur: 2,
		shadowOffsetX: 3,
		shadowOffsetY: 3,
		shadowColor: 'Black',
		order: 1,
	});

	scrawl.makeBezier({
		startX: 50,
		startY: 150,
		endX: 350,
		endY: 100,
		startControlX: 150,
		startControlY: 0,
		endControlX: 250,
		endControlY: 200,
		strokeStyle: 'Green',
		shadowBlur: 2,
		shadowOffsetX: 3,
		shadowOffsetY: 3,
		shadowColor: 'Black',
		lineWidth: 7,
		roll: -10,
		lineCap: 'round',
	});

	//display canvas
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
	extensions: ['path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
