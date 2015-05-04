var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var methods = ['draw', 'fill', 'drawFill', 'fillDraw', 'floatOver', 'sinkInto', 'none', 'clear'],
		myBlock,
		myLabel,
		counter = 0;

	//set cell background color
	scrawl.cell[scrawl.pad.mycanvas.base].set({
		backgroundColor: 'lightblue',
	}).clear();

	//define entitys
	myBlock = scrawl.makeBlock({ //template
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
	myLabel = scrawl.makePhrase({ //template label
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

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['block', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
