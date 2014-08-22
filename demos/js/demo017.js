var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//import images into scrawl library
	scrawl.getImagesByClass('demo017');

	//define the sprite
	scrawl.newPicture({
		source: 'peacock',
		width: 400,
		height: 200,
		copyX: 90,
		copyY: 130,
		copyWidth: 400,
		copyHeight: 200,
	});

	//display the canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'images',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
