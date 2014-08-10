var mycode = function() {
	'use strict';
	/* variables required by the static/real-time timing display
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	*/

	//define variables

	//code here

	//animation object
	scrawl.newAnimation({
		fn: function() {

			//code here

			/* real-time timing display - remove if using static timing display
			testNow = Date.now();
			testTime =  testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: '+parseInt(testTime, 10)+'; fps: '+parseInt(1000/testTime);
			*/
		},
	});

	/* static timing display - remove if using real-time timing display
	testNow = Date.now();
	testTime =  testNow - testTicker;
	testMessage.innerHTML = 'Render time: '+parseInt(testTime, 10)+'ms';
	*/
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: [],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
