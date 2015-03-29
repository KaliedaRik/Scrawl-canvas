var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var operations = ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-over', 'destination-atop', 'destination-in', 'destination-out', 'lighter', 'darker', 'copy', 'xor', 'normal', 'multiply', 'screen', 'overlay', 'color-dodge', 'color-burn', 'hue', 'saturation', 'color', 'luminosity'],
		tester,
		square,
		circle,
		label,
		counter = 0,
		camera;

	//stop display cell cleareing itself on each display cycle
	scrawl.cell[scrawl.pad.mycanvas.display].set({
		cleared: false,
	});

	//define entitys
	circle = scrawl.makeWheel({
		name: 'here',
		radius: 50,
		fillStyle: 'red',
		globalCompositeOperation: 'source-over',
	});
	square = scrawl.makeBlock({
		pivot: 'here',
		handleX: 'center',
		handleY: 'center',
		width: 120,
		height: 50,
		fillStyle: 'blue',
	});
	label = scrawl.makePhrase({
		pivot: 'here',
		handleX: 'center',
		handleY: 75,
		font: '14pt sans-serif',
		globalCompositeOperation: 'source-over',
	});

	//build scene
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 4; x++) {
			if (operations[counter]) {
				circle.set({
					startX: (x * 150) + 75,
					startY: (y * 150) + 75,
				});
				square.set({
					globalCompositeOperation: operations[counter],
				});
				label.set({
					text: operations[counter],
				});
			}
			scrawl.render();
			counter++;
		}
	}

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
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
