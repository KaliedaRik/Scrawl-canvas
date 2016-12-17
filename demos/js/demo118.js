var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.makeGradient({
		name: 'linearGradient',
		startX: 100,
		startY: 200,
		endX: 300,
		endY: 200,
		color: [{
			color: 'red',
			stop: 0
    }, {
			color: 'blue',
			stop: 0.9999
    }, ],
	});

	var topBlock = scrawl.makeBlock({
		name: 'linearBlock',
		startX: 20,
		startY: 20,
		width: 360,
		height: 170,
		lineWidth: 10,
		method: 'fillDraw',
		strokeStyle: 'gold',
		fillStyle: 'linearGradient'
	});

	scrawl.design.linearGradient.set({
		startX: -100,
		endX: 500,
		autoUpdate: true,
	});

	var bottomBlock;
	bottomBlock = topBlock.clone({
		startY: 210,
		strokeStyle: 'linearGradient',
		fillStyle: 'green'
	});

	scrawl.makeRadialGradient({
		name: 'radialGradient',
		startX: 'center',
		startY: 'center',
		startRadius: 1,
		endX: 'center',
		endY: 'center',
		endRadius: 300,
		color: [{
			color: 'green',
			stop: 0
    }, {
			color: 'gold',
			stop: 0.9999
    }, ],
	});
	topBlock.set({
		strokeStyle: 'radialGradient'
	});
	bottomBlock.set({
		fillStyle: 'radialGradient'
	});
	scrawl.render();

	var myNewColors = [];
	for (var i = 0; i < 1; i += 0.1) {
		myNewColors.push({
			color: '#8888ff',
			stop: i
		});
		myNewColors.push({
			color: '#aaffff',
			stop: (i + 0.05)
		});
	}
	myNewColors.push({
		color: '#8888ff',
		stop: 0.9999
	});

	scrawl.design.linearGradient.set({
		color: myNewColors,
		shift: 0.00035
	});

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
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
