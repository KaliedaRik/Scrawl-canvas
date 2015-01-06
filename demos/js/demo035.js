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
		currentScale = 1,
		currentXHandle = 0,
		currentYHandle = 0,
		currentFlipUpend = false,
		currentFlipReverse = false,
		scaleInput = document.getElementById('scale'), //capture DOM select and input elements
		xPercentInput = document.getElementById('xPercent'),
		yPercentInput = document.getElementById('yPercent'),
		xAbsoluteInput = document.getElementById('xAbsolute'),
		yAbsoluteInput = document.getElementById('yAbsolute'),
		xStringInput = document.getElementById('xString'),
		yStringInput = document.getElementById('yString'),
		reverseInput = document.getElementById('reverse'),
		upendInput = document.getElementById('upend'),
		updateScale, //for event listeners
		updateXPercent,
		updateYPercent,
		updateXAbsolute,
		updateYAbsolute,
		updateXString,
		updateYString,
		updateReverse,
		updateUpend,
		status = document.getElementById('status');

	//import image into scrawl library
	//scrawl.getImagesByClass('demo035');

	//setup DOM controls
	scaleInput.value = 1;
	xPercentInput.value = 0;
	yPercentInput.value = 0;
	xAbsoluteInput.value = 0;
	yAbsoluteInput.value = 0;
	xStringInput.options.selectedIndex = 1;
	yStringInput.options.selectedIndex = 1;
	reverseInput.options.selectedIndex = 0;
	upendInput.options.selectedIndex = 0;

	//define groups
	scrawl.newGroup({
		name: 'mylabels',
		order: 0,
	});
	myEntitys = scrawl.newGroup({
		name: 'myentitys',
		order: 1,
	});
	scrawl.newGroup({
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

	scrawl.newGradient({
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
		//source: 'angelfish',
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
	updateScale = function(e) {
		currentScale = scaleInput.value;
		myEntitys.setEntitysTo({
			scale: parseFloat(currentScale),
		});
		e.preventDefault();
		e.returnValue = false;
	};
	scaleInput.addEventListener('input', updateScale, false); //for firefox real-time updating
	scaleInput.addEventListener('change', updateScale, false);

	updateXPercent = function(e) {
		currentXHandle = xPercentInput.value + '%';
		myEntitys.setEntitysTo({
			handleX: currentXHandle,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	xPercentInput.addEventListener('input', updateXPercent, false);
	xPercentInput.addEventListener('change', updateXPercent, false);

	updateYPercent = function(e) {
		currentYHandle = yPercentInput.value + '%';
		myEntitys.setEntitysTo({
			handleY: currentYHandle,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	yPercentInput.addEventListener('input', updateYPercent, false);
	yPercentInput.addEventListener('change', updateYPercent, false);

	updateXAbsolute = function(e) {
		currentXHandle = xAbsoluteInput.value;
		myEntitys.setEntitysTo({
			handleX: parseFloat(currentXHandle),
		});
		e.preventDefault();
		e.returnValue = false;
	};
	xAbsoluteInput.addEventListener('input', updateXAbsolute, false);
	xAbsoluteInput.addEventListener('change', updateXAbsolute, false);

	updateYAbsolute = function(e) {
		currentYHandle = yAbsoluteInput.value;
		myEntitys.setEntitysTo({
			handleY: parseFloat(currentYHandle),
		});
		e.preventDefault();
		e.returnValue = false;
	};
	yAbsoluteInput.addEventListener('input', updateYAbsolute, false);
	yAbsoluteInput.addEventListener('change', updateYAbsolute, false);

	updateXString = function(e) {
		currentXHandle = xStringInput.value;
		myEntitys.setEntitysTo({
			handleX: currentXHandle,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	xStringInput.addEventListener('input', updateXString, false);
	xStringInput.addEventListener('change', updateXString, false);

	updateYString = function(e) {
		currentYHandle = yStringInput.value;
		myEntitys.setEntitysTo({
			handleY: currentYHandle,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	yStringInput.addEventListener('input', updateYString, false);
	yStringInput.addEventListener('change', updateYString, false);

	updateReverse = function(e) {
		currentFlipReverse = reverseInput.value;
		myEntitys.setEntitysTo({
			flipReverse: (currentFlipReverse === 'true') ? true : false,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	reverseInput.addEventListener('change', updateReverse, false);

	updateUpend = function(e) {
		currentFlipUpend = upendInput.value;
		myEntitys.setEntitysTo({
			flipUpend: (currentFlipUpend === 'true') ? true : false,
		});
		e.preventDefault();
		e.returnValue = false;
	};
	upendInput.addEventListener('change', updateUpend, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			myEntitys.updateEntitysBy({
				roll: 1,
			});
			scrawl.render();

			status.innerHTML = '<b>Current settings - scale:</b> ' + currentScale + '; <b>handleX:</b> ' + currentXHandle + '; <b>handleY:</b> ' + currentYHandle + '; <b>flipReverse:</b> ' + currentFlipReverse + '; <b>flipUpend:</b> ' + currentFlipUpend;
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
