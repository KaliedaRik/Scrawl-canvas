var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.getImageById('demo116');

	var pad = scrawl.pad.myCanvas;
	var canvas = scrawl.canvas.myCanvas;
	var controls, here, click;
	var x, y, k;
	var myTimeline;


	for (y = 0; y < 5; y++) {
		for (x = 0; x < 5; x++) {
			scrawl.makeWheel({
				name: 'dot_' + y + x,
				radius: '10%',
				startX: ((x * 20) + 10) + '%',
				startY: ((y * 20) + 10) + '%',
				scale: 2,
				order: 0
			});
		}
	}

	scrawl.makePicture({
		name: 'iris',
		source: 'demo116',
		globalCompositeOperation: 'source-in',
		order: 1
	});

	myTimeline = scrawl.makeTicker({
		name: 'disappear'
	});

	for (k = 0; k < 5; k++) {
		scrawl.makeTween({
			name: 'sequenceTween' + k,
			ticker: 'disappear',
			duration: 8000,
			time: k * 800,
			targets: [
				'dot_' + k + '0',
				'dot_' + k + '1',
				'dot_' + k + '2',
				'dot_' + k + '3',
				'dot_' + k + '4'
			],
			definitions: [
				{
					attribute: 'scale',
					start: 2,
					end: 0.001,
					engine: 'easeIn'
				}
			]
		});
	}

	controls = scrawl.makeGroup({
		name: 'controls',
		cell: pad.base,
		order: 2
	});
	scrawl.makePhrase({
		name: 'runButton',
		startX: 'center',
		startY: '4%',
		handleX: 'center',
		handleY: 'center',
		handleX: 'center',
		text: 'Run',
		fillStyle: 'yellow',
		backgroundColor: 'red',
		backgroundMargin: 10,
		globalCompositeOperation: 'source-over',
		group: 'controls'
	});

	click = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		var here = pad.getMouse();
		var button = controls.getEntityAt(here);
		if (button) {
			switch (button.name) {
				case 'runButton':
					myTimeline.halt();
					myTimeline.run();
					break;
				default:
					// do nothing
			}
		}
	};
	scrawl.addListener(['up'], click, canvas);

	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

	myTimeline.run();
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'wheel', 'images', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
