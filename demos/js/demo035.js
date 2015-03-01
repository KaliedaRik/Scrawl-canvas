var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myEntitys,
		pin,
		myCol,
		status = document.getElementById('status'),
		events,
		stopE;

	//setup DOM controls
	document.getElementById('scale').value = 1;
	document.getElementById('xPercent').value = 0;
	document.getElementById('yPercent').value = 0;
	document.getElementById('xAbsolute').value = 0;
	document.getElementById('yAbsolute').value = 0;
	document.getElementById('xString').options.selectedIndex = 1;
	document.getElementById('yString').options.selectedIndex = 1;
	document.getElementById('reverse').options.selectedIndex = 0;
	document.getElementById('upend').options.selectedIndex = 0;

	//define groups
	scrawl.makeGroup({
		name: 'mylabels',
		order: 0,
	});
	myEntitys = scrawl.makeGroup({
		name: 'myentitys',
		order: 1,
	});
	scrawl.makeGroup({
		name: 'mypins',
		order: 2,
	});

	//define designs (colors, gradients)
	scrawl.newColor({
		name: 'myRed',
		color: '#f00',
	});

	myCol = scrawl.newColor({
		name: 'myBlue',
		random: true,
		aShift: 0.002,
		aBounce: true,
		autoUpdate: true,
	});

	scrawl.makeGradient({
		name: 'gradient',
		shift: 0.002,
		lockTo: true,
		color: [{
			color: '#333333',
			stop: 0
        }, {
			color: 'orange',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'green',
			stop: 0.6
        }, {
			color: '#cccccc',
			stop: 0.8
        }, {
			color: '#333333',
			stop: 1
        }, ],
	});

	//define entitys
	pin = scrawl.newWheel({ //template entity
		radius: 3,
		method: 'fillDraw',
		fillStyle: '#880000',
		group: 'mypins',
		visibility: false,
	});

	scrawl.newPhrase({ //background texts
		startX: 400,
		startY: 100,
		globalAlpha: 0.3,
		font: '40pt Arial, sans-serif',
		handleX: 'center',
		handleY: 'center',
		text: 'Path entitys',
		group: 'mylabels',
	}).clone({
		startY: 300,
		text: 'Shape entitys',
	}).clone({
		startY: 500,
		text: 'Other entitys',
	});

	scrawl.makeRegularShape({
		name: 'myregularshape',
		startX: 100,
		startY: 100,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		method: 'fillDraw',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myregularshape',
		visibility: 'true',
	});

	scrawl.makeLine({
		name: 'mylineshape',
		startX: 300,
		startY: 100,
		endX: 390,
		endY: 100,
		lineWidth: 4,
		lineCap: 'round',
		strokeStyle: 'blue',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'mylineshape',
		visibility: 'true',
	});

	scrawl.makeQuadratic({
		name: 'myquadshape',
		startX: 500,
		startY: 100,
		controlX: 545,
		controlY: 10,
		endX: 590,
		endY: 100,
		lineWidth: 4,
		lineCap: 'round',
		strokeStyle: 'blue',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myquadshape',
		visibility: 'true',
	});

	scrawl.makeRectangle({
		name: 'myrectshape',
		startX: 700,
		startY: 100,
		width: 90,
		height: 40,
		radius: 8,
		lineWidth: 2,
		lineJoin: 'round',
		fillStyle: 'lightblue',
		method: 'fillDraw',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myrectshape',
		visibility: 'true',
	});

	scrawl.makeRegularShape({
		name: 'myregularoutline',
		shape: true,
		startX: 100,
		startY: 300,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		method: 'fillDraw',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myregularoutline',
		visibility: 'true',
	});

	scrawl.makeLine({
		name: 'mylineoutline',
		shape: true,
		startX: 300,
		startY: 300,
		endX: 390,
		endY: 300,
		lineWidth: 4,
		lineCap: 'round',
		strokeStyle: 'blue',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'mylineoutline',
		visibility: 'true',
	});

	scrawl.makeQuadratic({
		name: 'myquadoutline',
		shape: true,
		startX: 500,
		startY: 300,
		controlX: 545,
		controlY: 210,
		endX: 590,
		endY: 300,
		lineWidth: 4,
		lineCap: 'round',
		strokeStyle: 'blue',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myquadoutline',
		visibility: 'true',
	});

	scrawl.makeRectangle({
		name: 'myrectoutline',
		shape: true,
		startX: 700,
		startY: 300,
		width: 90,
		height: 40,
		radius: 8,
		lineWidth: 2,
		lineJoin: 'round',
		fillStyle: 'lightblue',
		method: 'fillDraw',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myrectoutline',
		visibility: 'true',
	});

	scrawl.newPicture({
		name: 'mypicture',
		url: 'img/carousel/angelfish.png',
		strokeStyle: 'Gold',
		lineWidth: 3,
		method: 'fillDraw',
		width: 100,
		height: 67,
		shadowBlur: 4,
		shadowColor: 'Black',
		startX: 100,
		startY: 500,
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'mypicture',
		visibility: 'true',
	});

	scrawl.newBlock({
		name: 'myblock',
		strokeStyle: 'Orange',
		fillStyle: 'myBlue',
		lineWidth: 6,
		method: 'fillDraw',
		width: 100,
		height: 100,
		startX: 300,
		startY: 500,
		lineDash: [20, 5],
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myblock',
		visibility: 'true',
	});

	scrawl.newWheel({
		name: 'mywheel',
		strokeStyle: '#800',
		fillStyle: 'gradient',
		lineWidth: 6,
		method: 'fillDraw',
		radius: 40,
		startX: 500,
		startY: 500,
		lineDash: [20, 5, 5, 5],
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'mywheel',
		visibility: 'true',
	});

	scrawl.newPhrase({
		name: 'myphrase',
		text: 'Hello Scrawl,\nHello World',
		startX: 700,
		startY: 500,
		font: '16pt Arial, Helvetica',
		group: 'myentitys',
	});
	pin.clone({
		pivot: 'myphrase',
		visibility: 'true',
	});

	//event listeners
	stopE = function(e) {
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
	};
	events = function(e) {
		var items = {};
		stop(e);
		switch (e.target.id) {
			case 'xAbsolute':
				items.handleX = Math.round(e.target.value);
				break;
			case 'xPercent':
				items.handleX = e.target.value + '%';
				break;
			case 'xString':
				items.handleX = e.target.value;
				break;
			case 'yAbsolute':
				items.handleY = Math.round(e.target.value);
				break;
			case 'yPercent':
				items.handleY = e.target.value + '%';
				break;
			case 'yString':
				items.handleY = e.target.value;
				break;
			case 'scale':
				items.scale = parseFloat(e.target.value);
				break;
			case 'reverse':
				items.flipReverse = (e.target.value === 'true') ? true : false;
				break;
			case 'upend':
				items.flipUpend = (e.target.value === 'true') ? true : false;
				break;
			default:
				items = false;
		}
		if (items) {
			myEntitys.setEntitysTo(items);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.newAnimation({
		fn: function() {
			myEntitys.updateEntitysBy({
				roll: 1,
			});
			scrawl.render();

			status.innerHTML = '<b>Current settings - scale:</b> ' + scrawl.entity.myblock.scale +
				'; <b>handleX:</b> ' + scrawl.entity.myblock.handle.x +
				'; <b>handleY:</b> ' + scrawl.entity.myblock.handle.y +
				'; <b>flipReverse:</b> ' + scrawl.entity.myblock.flipReverse +
				'; <b>flipUpend:</b> ' + scrawl.entity.myblock.flipUpend;

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
	modules: ['factories', 'block', 'wheel', 'path', 'shape', 'images', 'phrase', 'color', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
