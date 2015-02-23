var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//variables
	var myBlocks,
		myTween,
		myPad = scrawl.pad[scrawl.currentPad],
		myCanvas = scrawl.canvas[scrawl.currentPad],
		startNewTween,
		myEntity,
		myClone,
		here;

	//group
	myBlocks = scrawl.newGroup({
		name: 'blocks',
	});

	//entitys
	scrawl.newBlock({
		startX: 50,
		startY: 70,
		fillStyle: 'red',
		strokeStyle: 'blue',
		lineWidth: 5,
		method: 'fillDraw',
		width: 80,
		height: 80,
		handleX: 'center',
		handleY: 'center',
		group: 'blocks'
	}).clone({
		startX: 150,
	}).clone({
		startX: 250,
	}).clone({
		startX: 350,
	}).clone({
		startX: 450,
	}).clone({
		startX: 550,
	});

	//tweens
	myTween = scrawl.newTween({
		start: {
			startY: 70,
			roll: 0,
		},
		end: {
			startY: 330,
			roll: 180,
		},
		duration: 3000,
		count: 2,
		autoReverseAndRun: true,
		onComplete: {
			startY: 70,
			roll: 0,
		},
		killOnComplete: true,
	});

	//event listener
	startNewTween = function(e) {
		myEntity = myBlocks.getEntityAt(here);
		if (myEntity) {
			myClone = myTween.clone({
				targets: myEntity,
			});
			if (!myClone.run()) {
				myClone.kill();
			}
		}
	};
	scrawl.addListener('up', startNewTween, myCanvas);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
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
	modules: ['block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
