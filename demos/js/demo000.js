var mycode = function() {
	'use strict';

	/* variables required by the static/real-time timing display
  //hide-start
  var testTicker = Date.now(),
    testTime = testTicker,
    testNow,
    testMessage = document.getElementById('testmessage');
  //hide-end
  */

	//define variables

	//code here

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			//code here

			/* real-time timing display - remove if using static timing display
      //hide-start
      testNow = Date.now();
      testTime =  testNow - testTicker;
      testTicker = testNow;
      testMessage.innerHTML = 'Milliseconds per screen refresh: '+Math.ceil(testTime)+'; fps: '+Math.floor(1000/testTime);
      //hide-end
      */
		},
	});

	/* static timing display - remove if using real-time timing display
  //hide-start
  testNow = Date.now();
  testTime =  testNow - testTicker;
  testMessage.innerHTML = 'Render time: '+Math.ceil(testTime)+'ms';
  //hide-end
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
