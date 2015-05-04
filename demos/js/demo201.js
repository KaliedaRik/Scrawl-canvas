var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myWidth = window.innerWidth - 50,
		myHeight = window.innerHeight - 150;

	myWidth = (myWidth > 100) ? myWidth : 100;
	myHeight = (myHeight > 100) ? myHeight : 100;

	//add canvas to page; make it current
	scrawl.addCanvasToPage({
		stackName: 'mystack',
		name: 'mycanvas',
		parentElement: 'stackholder',
		width: myWidth,
		height: myHeight,
	}).makeCurrent();

	//define entitys
	scrawl.makePhrase({
		text: 'Hello, Scrawl World!',
		handleX: 'center',
		handleY: 'bottom',
		textAlign: 'center',
		startX: myWidth / 2,
		startY: (myHeight / 10) * 6,
		font: Math.ceil(myHeight / 10) + 'pt serif',
		method: 'fillDraw',
		fillStyle: 'Red',
		lineWidth: 1.5,
	}).clone({
		text: 'stack id: ' + scrawl.stk.mystack.id +
			'\ncanvas id: ' + scrawl.canvas.mycanvas.id +
			'\nwidth: ' + scrawl.canvas.mycanvas.getAttribute('width') +
			'px\nheight: ' + scrawl.canvas.mycanvas.getAttribute('height') + 'px',
		method: 'fill',
		fillStyle: 'Black',
		font: '16pt sans-serif',
		handleY: 'top',
	});

	//add another canvas to page; make it current
	scrawl.addCanvasToPage({
		stackName: 'mystack',
		name: 'mysecondcanvas',
		startX: 'right',
		startY: 'top',
		handleX: 'right',
		handleY: 'top',
		width: '30%',
		height: '30%',
	}).makeCurrent();

	//define some more entitys
	scrawl.makePhrase({
		text: 'Hello, I\'m a second canvas',
		handleX: 'center',
		handleY: 'top',
		textAlign: 'center',
		startX: '50%',
		startY: '20%',
		font: '24pt serif',
		method: 'fillDraw',
		fillStyle: 'Red',
	}).clone({
		text: 'stack id: ' + scrawl.stk.mystack.id +
			'\ncanvas id: ' + scrawl.canvas.mysecondcanvas.id +
			'\nwidth: ' + scrawl.canvas.mysecondcanvas.getAttribute('width') +
			'px\nheight: ' + scrawl.canvas.mysecondcanvas.getAttribute('height') + 'px',
		method: 'fill',
		fillStyle: 'Black',
		font: '12pt sans-serif',
		startY: '45%',
	});

	//display the canvases
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
