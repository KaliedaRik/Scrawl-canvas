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
		mypad = scrawl.pad.mycanvas,
		mydiv = scrawl.element.testpanel,
		mycanvas = scrawl.pad.mycanvas,
		eldiv = scrawl.elm.testpanel,
		elstk = scrawl.stk.mystack,
		here;

	//style the stack
	mystack.set({
		width: 600,
		height: 400,
		perspectiveZ: 1000,
		border: '1px solid red',
	});

	//style the stack elements
	mycanvas.set({
		startX: 300,
		startY: 200,
		handleX: 'center',
		handleY: 'center',
	});
	mydiv.set({
		startX: 150,
		startY: 100,
		width: 300,
		height: 200,
		border: '1px solid black',
		overflow: 'hidden',
		handleX: 'center',
		handleY: 'center',
		//pointerEvents: 'none',
	});

	//build entity
	scrawl.newWheel({
		name: 'mywheel',
		radius: 70,
		fillStyle: 'blue',
		strokeStyle: 'red',
		lineWidth: 10,
		method: 'fillDraw',
		pivot: 'mouse',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {

			scrawl.entity.mywheel.set({
				visibility: (mycanvas.getMouse().active) ? true : false,
			});
			scrawl.render();
			mycanvas.setDelta({
				yaw: 0.5,
			});
			mydiv.setDelta({
				pitch: 0.5,
			});
			scrawl.renderElements();

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
	modules: ['animation', 'stacks', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
