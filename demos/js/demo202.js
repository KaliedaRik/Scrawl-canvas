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
		elstack = scrawl.stk.mystack,
		cw = 280,
		ch = 315,
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
		visibility: false
	});

	//stop touchmove dragging the page up/down
	scrawl.addListener(['move', 'down'], function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		here = mystack.getMouse();
		myScale = (1 - ((Math.abs(here.y - (mystack.height / 2)) / mystack.height) + (Math.abs(here.x - (mystack.width / 2)) / mystack.width))) + 0.1;
		mycow.set({
			width: (here.active) ? Math.floor(cw * myScale) : 1,
			height: (here.active) ? Math.floor(ch * myScale) : 1,
			visibility: (here.active) ? true : false,
			mouseIndex: here.id
		});
	}, elstack);

	here = mystack.getMouse();

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			mycow.set({
				visibility: (here.active) ? true : false,
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
