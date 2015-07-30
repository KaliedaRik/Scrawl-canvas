var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define block entity
	scrawl.makeBlock({
		name: 'myblock',
		startX: 10,
		startY: 10,
		width: 180,
		height: 180,
		stable: true
	});

	//clone block
	scrawl.entity.myblock.clone({
		startX: 210,
		scale: 0.8,
		lineWidth: 5,
		method: 'draw'
	});

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			//update canvas display
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.round(testTime) + '; fps: ' + Math.round(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: 'block',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
