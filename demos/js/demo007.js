var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var methods = ['draw', 'fill', 'drawFill', 'fillDraw', 'floatOver', 'sinkInto', 'none', 'clear'],
		myBlock,
		myLabel,
		counter = 0;

	//set cell background color
	scrawl.cell[scrawl.pad.mycanvas.base].set({
		backgroundColor: 'lightblue',
	}).compile();

	//define sprites
	myBlock = scrawl.newBlock({ //template
		name: 'template',
		width: 50,
		height: 50,
		handleX: 'center',
		handleY: 'center',
		fillStyle: 'Gold',
		strokeStyle: 'rgb(0, 190, 0)',
		lineWidth: 10,
		shadowOffsetX: 4,
		shadowOffsetY: 4,
		shadowBlur: 4,
		shadowColor: 'black',
	});
	myLabel = scrawl.newPhrase({ //template label
		pivot: 'template',
		handleX: 'center',
		handleY: 50,
	});

	//stamping loops
	for (var y = 0; y < 2; y++) {
		for (var x = 0; x < 4; x++) {
			myBlock.set({
				method: methods[counter],
				startX: (x * 100) + 50,
				startY: (y * 100) + 55,
			}).stamp();
			myLabel.set({
				text: methods[counter],
			}).stamp();
			counter++;
		}
	}

	//display results
	scrawl.show();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
