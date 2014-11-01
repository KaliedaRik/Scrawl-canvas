var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var pad = scrawl.pad.mycanvas,
		canvas = scrawl.canvas.mycanvas,
		zoomCell,
		moveCell,
		zoom,
		zoomStep = 20,
		moveStep = 10,
		bigCell,
		myGroup,
		myColor,
		moveEntitys,
		myEntity,
		msg = document.getElementById('message');

	//add cell to canvas
	bigCell = pad.addNewCell({
		name: 'bigcell',
		width: 1600,
		height: 1200,
		copyX: 600,
		copyY: 400,
		copyWidth: 400,
		copyHeight: 400,
		copyMaxWidth: 1200,
		copyMaxHeight: 1200,
		copyMinWidth: 100,
		copyMinHeight: 100,
		pasteX: 0,
		pasteY: 0,
		pasteWidth: 400,
		pasteHeight: 400,
		backgroundColor: '#f4f4f4',
	});
	pad.setDrawOrder(['bigcell']);
	myGroup = scrawl.group.bigcell;

	//define designs (colors)
	myColor = scrawl.newColor({
		a: 1,
		aMin: 1,
		rMax: 200,
		gMax: 200,
		bMax: 200,
	});

	//define entitys
	scrawl.newBlock({
		startX: 10,
		startY: 10,
		width: 1580,
		height: 1180,
		group: 'bigcell',
		method: 'draw',
		lineWidth: 5,
	});

	scrawl.newPhrase({
		text: 'This cell is zoomable\n' +
			'Use the + and - keys to zoom in or out\n' +
			'(or use the mouse wheel for zooming)\n' +
			'Use the arrow keys to move around the cell',
		fillStyle: 'grey',
		startX: 800,
		startY: 600,
		handleX: 'center',
		handleY: 'center',
		textAlign: 'center',
		group: 'bigcell',
	});

	for (var i = 0; i < 10; i++) {
		scrawl.makeRegularShape({
			outline: true,
			startX: 800,
			startY: 600,
			deltaX: (Math.random() * 10) - 5,
			deltaY: (Math.random() * 8) - 5,
			radius: (Math.random() * 150) + 30,
			angle: (Math.floor(Math.random() * 20) + 15) * 4,
			strokeStyle: myColor.get('random'),
			group: 'bigcell',
		});
	}

	//helper function - zoom cell within canvas
	zoomCell = function(item) {
		bigCell.zoom(item);
	};

	//helper function -  move cell within canvas
	moveCell = function(item) {
		var myX,
			myY,
			sw = bigCell.copyWidth,
			sh = bigCell.copyHeight,
			sx = bigCell.copy.x,
			sy = bigCell.copy.y,
			aw = bigCell.actualWidth,
			ah = bigCell.actualHeight;
		myX = (scrawl.isBetween((sx + item.x), 0, (aw - sw), true)) ? sx + item.x : sx;
		myY = (scrawl.isBetween((sy + item.y), 0, (ah - sh), true)) ? sy + item.y : sy;
		bigCell.copy.x = myX;
		bigCell.copy.y = myY;
	};

	//event listener - mouse wheel
	zoom = function(e) {
		//zoomDelta will set to +1 or -1, depending on the direction the mouse wheel is spun
		var zoomDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		zoomCell(zoomDelta * zoomStep);
		e.preventDefault();
		e.returnValue = false;
	};
	canvas.addEventListener('mousewheel', zoom, false);
	canvas.addEventListener('DOMMouseScroll', zoom, false);

	//event listeners - keyboard
	Mousetrap.bind('-', function(e) {
		zoomCell(zoomStep);
	});
	Mousetrap.bind('+', function(e) {
		zoomCell(-zoomStep);
	});
	Mousetrap.bind('up', function(e) {
		moveCell({
			x: 0,
			y: -moveStep
		});
		return false;
	});
	Mousetrap.bind('down', function(e) {
		moveCell({
			x: 0,
			y: moveStep
		});
		return false;
	});
	Mousetrap.bind('left', function(e) {
		moveCell({
			x: -moveStep,
			y: 0
		});
		return false;
	});
	Mousetrap.bind('right', function(e) {
		moveCell({
			x: moveStep,
			y: 0
		});
		return false;
	});

	//animation function
	moveEntitys = function() {
		for (var i = 0, z = myGroup.entitys.length; i < z; i++) {
			myEntity = scrawl.entity[myGroup.entitys[i]];
			if (!scrawl.isBetween((myEntity.start.x + myEntity.delta.x), 0, 1600)) {
				myEntity.delta.x = -myEntity.delta.x;
			}
			if (!scrawl.isBetween((myEntity.start.y + myEntity.delta.y), 0, 1200)) {
				myEntity.delta.y = -myEntity.delta.y;
			}
			myEntity.updateStart();
		}
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveEntitys();
			pad.render();

			message.innerHTML = 'Current zoom: ' + ((400 / bigCell.copyWidth) * 100).toFixed(2) + '%';

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
	modules: ['factories', 'path', 'phrase', 'animation', 'collisions', 'block', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
