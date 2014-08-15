var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var mycanvas = scrawl.pad.mycanvas,
		shape = [],
		myShape,
		control,
		now,
		spritePie,
		hourHand,
		minuteHand,
		secondHand,
		minX = -30,
		maxX = 270,
		minY = -30,
		maxY = 270,
		minR = 0.5,
		maxR = 1.3,
		choke = 20,
		chokeTime = Date.now(),
		regularShapes = 4,
		linearShapes = 1,
		wheels = 2,
		count = 0,
		regularShapesAlpha = 0.5,
		linearShapesAlpha = 0.75,
		wheelsAlpha = 0.5,
		myColor,
		getColor,
		doClock,
		buildCells,
		buildClock,
		buildSprites,
		myX,
		myY,
		myS,
		updateClock;

	//define designs (colors)
	myColor = scrawl.newColor({
		a: 1,
		random: true,
	});
	getColor = function(alpha) {
		return myColor.set({
			a: alpha,
			random: true,
		}).get();
	};

	//build functions
	doClock = function() {
		buildCells();
		buildClock();
		buildSprites();
	};

	//define cells
	buildCells = function() {
		mycanvas.addNewCell({
			name: 'kaliedoscopeBackground',
			height: 240,
			width: 240,
		});
		mycanvas.addNewCell({
			name: 'kaliedoscopeSegment',
			height: 240,
			width: 120,
		});
		mycanvas.addNewCell({
			name: 'kaliedoscope',
			targetX: 250,
			height: 500,
			width: 500,
		});
		mycanvas.addNewCell({
			name: 'clock',
			targetX: 250,
			height: 500,
			width: 500,
		});
		mycanvas.setDrawOrder(['kaliedoscope', 'clock']);
	};

	//define kaliedoscope sprites
	buildSprites = function() {
		var i;
		for (i = 0; i < regularShapes; i++) {
			myShape = scrawl.makeRegularShape({
				startX: (Math.floor(Math.random() * 140)) + 50,
				startY: (Math.floor(Math.random() * 140)) + 50,
				lineWidth: Math.floor((Math.random() * 6) + 1),
				strokeStyle: getColor(regularShapesAlpha),
				fillStyle: getColor(regularShapesAlpha),
				method: 'fillDraw',
				radius: Math.floor((Math.random() * 80) + 20),
				sides: Math.floor((Math.random() * 6) + 3),
				shape: true,
				handleX: 'center',
				handleY: 'center',
				group: 'kaliedoscopeBackground',
				order: count,
			});
			control = {
				s: myShape,
				x: (Math.floor(Math.random() * 150) + 40) / 500,
				y: (Math.floor(Math.random() * 150) + 40) / 500,
				r: (Math.floor(Math.random() * 9) + 1) / 1000,
			};
			shape.push(control);
			count++;
		}
		for (i = 0; i < linearShapes; i++) {
			myShape = scrawl.makeRegularShape({
				startX: (Math.floor(Math.random() * 140)) + 50,
				startY: (Math.floor(Math.random() * 140)) + 50,
				lineWidth: 1,
				strokeStyle: getColor(linearShapesAlpha),
				method: 'draw',
				radius: Math.floor((Math.random() * 80) + 20),
				angle: 160,
				shape: true,
				handleX: 'center',
				handleY: 'center',
				group: 'kaliedoscopeBackground',
				order: count,
			});
			control = {
				s: myShape,
				x: (Math.floor(Math.random() * 150) + 40) / 400,
				y: (Math.floor(Math.random() * 150) + 40) / 400,
				r: (Math.floor(Math.random() * 9) + 1) / 1000,
			};
			shape.push(control);
			count++;
		}
		for (i = 0; i < wheels; i++) {
			myShape = scrawl.newWheel({
				startX: (Math.floor(Math.random() * 140)) + 50,
				startY: (Math.floor(Math.random() * 140)) + 50,
				lineWidth: Math.floor((Math.random() * 6) + 1),
				strokeStyle: getColor(wheelsAlpha),
				fillStyle: getColor(wheelsAlpha),
				method: 'fillDraw',
				radius: Math.floor((Math.random() * 80) + 20),
				group: 'kaliedoscopeBackground',
				order: count,
			});
			control = {
				s: myShape,
				x: (Math.floor(Math.random() * 150) + 40) / 300,
				y: (Math.floor(Math.random() * 150) + 40) / 300,
				r: (Math.floor(Math.random() * 9) + 1) / 1000,
			};
			shape.push(control);
			count++;
		}
	};

	//define clock sprites
	buildClock = function() {
		scrawl.newPicture({
			name: 'segment',
			source: 'kaliedoscopeBackground',
			method: 'fill',
			group: 'kaliedoscopeSegment',
			globalCompositeOperation: 'source-in',
			width: 120,
			height: 240,
			copyX: 60,
			copyY: 5,
			copyWidth: 120,
			copyHeight: 235,
			order: 1,
		});
		scrawl.newWheel({
			name: 'stencil',
			startX: 60,
			startY: 240,
			radius: 239,
			startAngle: -105,
			endAngle: -75,
			method: 'fill',
			includeCenter: true,
			clockwise: false,
			order: 0,
			group: 'kaliedoscopeSegment',
		});
		scrawl.newWheel({
			name: 'clockButton',
			startX: 250,
			startY: 250,
			radius: 5,
			method: 'fillDraw',
			fillStyle: 'gold',
			order: 8,
			group: 'clock',
		});
		spritePie = scrawl.newPicture({
			name: 'kaliedoscope',
			source: 'kaliedoscopeSegment',
			method: 'fill',
			lineWidth: 0,
			group: 'kaliedoscope',
			width: 120,
			height: 240,
			pivot: 'clockButton',
			handleX: 'center',
			handleY: 'bottom',
		});
		scrawl.newWheel({
			name: 'rimBase',
			pivot: 'clockButton',
			radius: 240,
			strokeStyle: 'DarkRed',
			lineWidth: 12,
			method: 'draw',
			group: 'clock',
			order: 2,
		}).clone({
			name: 'rim',
			strokeStyle: 'Gold',
			lineWidth: 10,
			group: 'clock',
			order: 3,
		}).clone({
			name: 'rimHighlight',
			strokeStyle: 'DarkRed',
			lineWidth: 1,
			group: 'clock',
			order: 4,
		});
		hourHand = scrawl.newShape({
			name: 'hour',
			pivot: 'clockButton',
			method: 'fill',
			fillStyle: 'black',
			order: 5,
			group: 'clock',
			data: 'l200,8-200,8z',
			handleY: '100%',
			handleX: '5%',
		});
		minuteHand = hourHand.clone({
			name: 'minute',
			data: 'l230,6-230,6z',
			order: 6,
		});
		secondHand = hourHand.clone({
			name: 'second',
			order: 7,
			data: 'l250,5-250,5z',
			fillStyle: 'darkred',
		});
	};

	//animation functions
	updateClock = function() {
		var i, iz;
		if (chokeTime + choke < Date.now()) {
			chokeTime = Date.now();
			for (i = 0, iz = shape.length; i < iz; i++) {
				myX = shape[i].s.start.x;
				myY = shape[i].s.start.y;
				myS = shape[i].s.scale;
				shape[i].x = (scrawl.isBetween((myX + shape[i].x), maxX, minX, true)) ? shape[i].x : -shape[i].x;
				shape[i].y = (scrawl.isBetween((myY + shape[i].y), maxY, minY, true)) ? shape[i].y : -shape[i].y;
				shape[i].r = (scrawl.isBetween((myS + shape[i].r), maxR, minR, true)) ? shape[i].r : -shape[i].r;
				shape[i].s.setDelta({
					startX: shape[i].x,
					startY: shape[i].y,
					scale: shape[i].r,
				});
			}
			mycanvas.clear();
			now = new Date();
			var tH = (now.getHours() >= 12) ? now.getHours() - 12 : now.getHours();
			var tM = now.getMinutes();
			var tS = now.getSeconds();
			var tL = now.getMilliseconds();
			secondHand.roll = (((tS * 1000) + tL) * (360 / 60000)) - 90;
			minuteHand.roll = (((tM * 60) + tS) * (360 / 3600)) - 90;
			hourHand.roll = (((tH * 60) + tM) * (360 / 720)) - 90;
			mycanvas.compile(['kaliedoscopeBackground', 'kaliedoscopeSegment']);
			for (i = 1; i < 7; i++) {
				spritePie.set({
					roll: (i * 60) + 15,
					flipReverse: false,
				}).stamp().set({
					roll: (i * 60) + 45,
					flipReverse: true,
				}).stamp();
			}
			mycanvas.compile(['clock']);
			mycanvas.show();
		}
	};

	//initialize scene
	doClock();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			updateClock();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['animation', 'shape', 'factories', 'color', 'images', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
