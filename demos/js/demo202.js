var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var mystack = scrawl.stack.mystack,
		cw = 280,
		ch = 315,
		mypad = scrawl.pad.mycanvas,
		mycow = scrawl.element.cow,
		here,
		myScale;

	//style the stack
	mystack.set({
		width: 600,
		height: 400,
		overflow: 'hidden',
	});

	//style the stack elements
	mycow.set({
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		pointerEvents: 'none',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = mystack.getMouse();
			myScale = (1 - ((Math.abs(here.y - (mystack.height / 2)) / mystack.height) + (Math.abs(here.x - (mystack.width / 2)) / mystack.width))) + 0.1;
			mycow.set({
				width: (here.active) ? Math.floor(cw * myScale) : 1,
				height: (here.active) ? Math.floor(ch * myScale) : 1,
			});
			scrawl.render();

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
	modules: ['animation', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
