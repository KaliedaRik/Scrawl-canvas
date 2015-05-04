var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myMessage = document.getElementById('message'),
		mouseDown = false,
		currentEntity = false,
		myPad = scrawl.pad.mycanvas,
		myCanvas = scrawl.canvas.mycanvas,
		here,
		sX,
		sY,
		myColor,
		lines,
		startDrawing,
		keepDrawing,
		endDrawing,
		stopE,
		spinLines;

	//setup canvas
	scrawl.cell[myPad.base].set({
		backgroundColor: '#eee',
	});

	//define designs (color)
	myColor = scrawl.makeColor({
		rMin: 50,
		rMax: 220,
		gMin: 50,
		gMax: 220,
		bMin: 50,
		bMax: 220,
		a: 1,
	});

	//define groups
	lines = scrawl.makeGroup({
		name: 'lines',
	});

	//event listeners
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	startDrawing = function(e) {
		stopE(e);
		here = myPad.getMouse();
		mouseDown = true;
		currentEntity = scrawl.makeShape({
			start: here.getData(),
			method: 'draw',
			lineWidth: 10,
			lineJoin: 'round',
			lineCap: 'round',
			strokeStyle: myColor.clone({
				random: true,
				a: 1
			}).name,
			data: 'l0,0 ',
			group: 'lines',
			order: lines.entitys.length
		});
		sX = here.x;
		sY = here.y;
	};
	scrawl.addListener('down', startDrawing, scrawl.canvas.mycanvas);

	endDrawing = function(e) {
		stopE(e);
		if (currentEntity) {
			currentEntity = false;
		}
		mouseDown = false;
	};
	scrawl.addListener('up', endDrawing, scrawl.canvas.mycanvas);

	//animation functions
	keepDrawing = function() {
		if (currentEntity) {
			here = myPad.getMouse();
			if (here.x !== sX || here.y !== sY) {
				currentEntity.set({
					data: currentEntity.data + ' ' + (here.x - sX) + ',' + (here.y - sY),
				});
				sX = here.x;
				sY = here.y;
			}
		}
	};
	spinLines = function() {
		for (var i = 0, z = lines.entitys.length; i < z; i++) {
			scrawl.entity[lines.entitys[i]].setDelta({
				roll: 1,
			});
		}
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			if (myPad.getMouse().active) {
				if (mouseDown) {
					keepDrawing();
				}
				else {
					spinLines();
				}
				myMessage.innerHTML = (mouseDown) ? 'Drawing...' : 'Click-and-drag to draw lines';
			}
			else {
				if (currentEntity) {
					endDrawing();
				}
				myMessage.innerHTML = 'Click-and-drag to draw lines';
				spinLines();
			}
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'shape', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
