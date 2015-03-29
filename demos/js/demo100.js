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
	myBlocks = scrawl.makeGroup({
		name: 'blocks',
	});

	//entitys
	scrawl.makeBlock({
		name: 'block1',
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
		name: 'block2',
		startX: 150,
	}).clone({
		name: 'block3',
		startX: 250,
	}).clone({
		name: 'block4',
		startX: 350,
	}).clone({
		name: 'block5',
		startX: 450,
	}).clone({
		name: 'block6',
		startX: 550,
	});

	//tweens
	myTween = scrawl.makeTween({
		start: {
			startY: 70,
			roll: 0,
		},
		end: {
			startY: 330,
			roll: 180,
		},
		engines: {
			startY: 'out',
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
		var eng;
		myEntity = myBlocks.getEntityAt(here);
		if (myEntity) {
			switch (myEntity.name) {
				case 'block1':
					eng = {
						startY: 'easeIn',
						roll: 'easeOut'
					};
					break;
				case 'block2':
					eng = {
						startY: 'easeIn3',
						roll: 'easeOut3'
					};
					break;
				case 'block3':
					eng = {
						startY: 'easeIn5',
						roll: 'easeOut5'
					};
					break;
				case 'block4':
					eng = {
						startY: 'easeOutIn',
						roll: 'easeOutIn3'
					};
					break;
				case 'block5':
					eng = {
						startY: 'easeOutIn4',
						roll: 'easeOutIn5'
					};
					break;
				case 'block6':
					eng = {
						startY: 'in',
						roll: 'out'
					};
					break;
			}
			myClone = myTween.clone({
				targets: myEntity,
				engines: eng,
			});
			if (!myClone.run()) {
				myClone.kill();
			}
		}
	};
	scrawl.addListener('up', startNewTween, myCanvas);

	//stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}, myCanvas);

	//animation object
	scrawl.makeAnimation({
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
	modules: ['animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
