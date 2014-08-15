var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//variables
	var myBlocks,
		myTween,
		myPad = scrawl.pad[scrawl.currentPad],
		myCanvas = scrawl.canvas[scrawl.currentPad],
		startNewTween,
		mySprite,
		myClone,
		here;

	//group
	myBlocks = scrawl.newGroup({
		name: 'blocks',
	});

	//sprites
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
		mySprite = myBlocks.getSpriteAt(here);
		if (mySprite) {
			myClone = myTween.clone({
				targets: mySprite,
			});
			if (!myClone.run()) {
				myClone.kill();
			}
		}
	};
	myCanvas.addEventListener('click', startNewTween, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
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
