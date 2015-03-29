var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var carousel,
		myPad = scrawl.pad.mycanvas,
		myGroup = scrawl.group[myPad.base],
		myPin0,
		myPin1,
		myPin2,
		myPin3,
		label0,
		label1,
		label2,
		label3,
		updateLabels;

	//setup canvas
	scrawl.cell[myPad.base].set({
		backgroundColor: '#cfe8f8',
	});

	//define entitys
	carousel = scrawl.makeEllipse({
		name: 'carousel',
		startX: 300,
		startY: 200,
		radiusX: 200,
		radiusY: 100,
		method: 'draw',
	});

	myPin2 = scrawl.makeWheel({
		name: 'pin2',
		radius: 5,
		fillStyle: 'black',
		path: 'carousel',
		pathPlace: 0,
		deltaPathPlace: 0.001,
	});
	myPin0 = myPin2.clone({
		name: 'pin0',
		fillStyle: 'red',
		pathPlace: 0.75,
	});
	myPin1 = myPin2.clone({
		name: 'pin1',
		fillStyle: 'green',
		pathPlace: 0.25,
	});
	myPin3 = myPin2.clone({
		name: 'pin3',
		fillStyle: 'blue',
		pathPlace: 0.5,
	});
	label2 = scrawl.makePhrase({
		name: 'normal',
		pivot: 'pin2',
		handleX: 'center',
		textAlign: 'center',
		font: '16pt Arial, sans-serif',
		handleY: '110%',
	});
	label0 = label2.clone({
		name: 'upended',
		pivot: 'pin0',
		flipUpend: true,
	});
	label1 = label2.clone({
		name: 'reversed',
		pivot: 'pin1',
		flipReverse: true,
	});
	label3 = label2.clone({
		name: 'both',
		pivot: 'pin3',
		flipReverse: true,
		flipUpend: true,
	});

	//animation function
	updateLabels = function() {
		label0.set({
			text: 'x: ' + Math.floor(myPin0.start.x) + ', y: ' + Math.floor(myPin0.start.y) + '\nI\'m upended',
		});
		label1.set({
			text: 'x: ' + Math.floor(myPin1.start.x) + ', y: ' + Math.floor(myPin1.start.y) + '\nI\'m reversed',
		});
		label2.set({
			text: 'x: ' + Math.floor(myPin2.start.x) + ', y: ' + Math.floor(myPin2.start.y) + '\nI\'m normal',
		});
		label3.set({
			text: 'x: ' + Math.floor(myPin3.start.x) + ', y: ' + Math.floor(myPin3.start.y) + '\nI\'m upended\nand reversed',
		});
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			myGroup.updateStart();
			updateLabels();
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
	modules: ['wheel', 'path', 'factories', 'phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
