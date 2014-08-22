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
		gradientTween,
		colorTween,
		myPad = scrawl.pad[scrawl.currentPad],
		myCanvas = scrawl.canvas[scrawl.currentPad],
		startNewTween,
		mySprite,
		here;

	//group
	myBlocks = scrawl.newGroup({
		name: 'blocks',
	});

	//designs
	scrawl.newColor({
		name: 'mycolor',
	});

	scrawl.newGradient({
		name: 'mygradient',
		setToSprite: true,
		startRangeY: 0,
		endRangeY: 0,
		color: [{
			color: 'rgba(127,127,255,0.6)',
			stop: 0
        }, {
			color: '#aaffff',
			stop: 0.05
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.1
        }, {
			color: '#aaffff',
			stop: 0.15
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.2
        }, {
			color: '#aaffff',
			stop: 0.25
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.3
        }, {
			color: '#aaffff',
			stop: 0.35
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.4
        }, {
			color: '#aaffff',
			stop: 0.45
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.5
        }, {
			color: '#aaffff',
			stop: 0.55
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.6
        }, {
			color: '#aaffff',
			stop: 0.65
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.7
        }, {
			color: '#aaffff',
			stop: 0.75
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.8
        }, {
			color: '#aaffff',
			stop: 0.85
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.9
        }, {
			color: '#aaffff',
			stop: 0.95
        }, {
			color: 'rgba(127,127,255,0.6)',
			stop: 0.9999
        }, ],
	});

	//sprites
	scrawl.newBlock({
		name: 'block1',
		startX: 25,
		startY: 25,
		fillStyle: 'mycolor',
		strokeStyle: 'blue',
		lineWidth: 20,
		method: 'fillDraw',
		width: 250,
		height: 250,
		group: 'blocks'
	}).clone({
		name: 'block2',
		fillStyle: 'mygradient',
		startX: 325,
	});

	//tweens
	colorTween = scrawl.newTween({
		targets: scrawl.design.mycolor,
		start: {
			r: 0,
			g: 0
		},
		end: {
			r: 100,
			g: 200
		},
		onComplete: {
			r: 0,
			g: 0
		},
		duration: 3000,
		count: 2,
		autoReverseAndRun: true,
	});

	gradientTween = scrawl.newTween({
		targets: scrawl.design.mygradient,
		end: {
			roll: 0.025
		},
		start: {
			roll: 0
		},
		onComplete: {
			roll: 0
		},
		duration: 3000,
		count: 2,
		autoReverseAndRun: true,
	});

	//event listener
	startNewTween = function(e) {
		mySprite = myBlocks.getSpriteAt(here);
		if (mySprite) {
			switch (mySprite.name) {
				case 'block1':
					colorTween.run();
					break;
				case 'block2':
					gradientTween.run();
					break;
			}
		}
	};
	myCanvas.addEventListener('click', startNewTween, false);

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
	modules: ['block', 'color', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
