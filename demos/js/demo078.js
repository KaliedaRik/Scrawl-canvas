var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var operations = ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-over', 'destination-atop', 'destination-in', 'destination-out', 'lighter', 'darker', 'copy', 'xor', 'normal', 'multiply', 'screen', 'overlay', 'color-dodge', 'color-burn', 'hue', 'saturation', 'color', 'luminosity'],
		tester,
		square,
		circle,
		label,
		counter = 0,
		camera;

	//define cells
	tester = scrawl.pad.mycanvas.addNewCell({
		name: 'tester',
		width: 150,
		height: 150,
	});

	//define sprites
	circle = scrawl.newWheel({
		name: 'here',
		startX: 75,
		startY: 75,
		radius: 50,
		fillStyle: 'red',
		group: 'tester',
	});
	square = scrawl.newBlock({
		pivot: 'here',
		handleX: 'center',
		handleY: 'center',
		width: 120,
		height: 50,
		fillStyle: 'blue',
		group: 'tester',
	});
	label = scrawl.newPhrase({
		pivot: 'here',
		handleX: 'center',
		handleY: 75,
		font: '14pt sans-serif',
		group: 'tester',
	});
	camera = scrawl.newPicture({
		width: 150,
		height: 150,
		source: 'tester',
	});

	//compile scene
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 4; x++) {
			if (operations[counter]) {
				tester.clear();
				circle.stamp();
				square.set({
					globalCompositeOperation: operations[counter],
				}).stamp();
				label.set({
					text: operations[counter],
				}).stamp();
				camera.set({
					startX: x * 150,
					startY: y * 150,
				}).stamp();
			}
			counter++;
		}
	}

	//display canvas
	scrawl.pad.mycanvas.show();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'phrase', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
