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
		myPad = scrawl.pad.mycanvas,
		myCanvas = scrawl.canvas.mycanvas,
		startNewTween,
		myEntity,
		here;

	//group
	myBlocks = scrawl.makeGroup({
		name: 'blocks',
	});

	//styless
	scrawl.makeColor({
		name: 'mycolor',
	});

	scrawl.makeGradient({
		name: 'mygradient',
		setToEntity: true,
		endY: 0,
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

	//entitys
	scrawl.makeBlock({
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
	colorTween = scrawl.makeTween({
		name: 'tween1',
		duration: 3000,
		targets: scrawl.styles.mycolor,
		reverseOnCycleEnd: true,
		cycles: 2,
		definitions: [
			{
				attribute: 'r',
				start: 0,
				end: 100,

			},
			{
				attribute: 'g',
				start: 0,
				end: 200,
			}
		]
	});

	gradientTween = scrawl.makeTween({
		name: 'tween2',
		duration: 3000,
		targets: scrawl.styles.mygradient,
		reverseOnCycleEnd: true,
		cycles: 2,
		definitions: [
			{
				attribute: 'shift',
				start: 0,
				end: 0.02,
			}
		]
	});

	//event listener
	startNewTween = function(e) {
		myEntity = myBlocks.getEntityAt(here);
		if (myEntity) {
			switch (myEntity.name) {
				case 'block1':
					colorTween.run();
					break;
				case 'block2':
					gradientTween.run();
					break;
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['block', 'color', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
