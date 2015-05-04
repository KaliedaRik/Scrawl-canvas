var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var pad1,
		pad2,
		group1,
		group2,
		pad1Here,
		pad2Here,
		currentEntity = false,
		startMove,
		continueMove,
		endMove,
		setActivePad,
		activePad = 0,
		stopE;

	//add canvases to page
	pad1 = scrawl.addCanvasToPage({
		name: 'canvas1',
		parentElement: 'canvas1Host',
		width: 400,
		height: 200,
	});
	pad2 = scrawl.addCanvasToPage({
		name: 'canvas2',
		parentElement: 'canvas2Host',
		width: 400,
		height: 200,
	});
	scrawl.canvas.canvas1.style.border = '1px solid green';
	scrawl.canvas.canvas2.style.border = '1px solid green';

	//define groups
	group1 = scrawl.group[pad1.base];
	group2 = scrawl.group[pad2.base];

	//make first pad the current pad
	pad1.makeCurrent();

	//define entitys
	scrawl.makeBlock({
		name: 'box1',
		startX: 10,
		startY: 10,
		width: 80,
		height: 40,
		method: 'fillDraw',
		fillStyle: 'red',
	}).clone({
		name: 'box2',
		startX: 110,
	}).clone({
		name: 'box3',
		startX: 210,
	}).clone({
		name: 'box4',
		startX: 310,
	});

	//event listeners
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	setActivePad = function(e) {
		//each pad has its own mouse/pointer/touch tracker
		pad1Here = pad1.getMouse();
		pad2Here = pad2.getMouse();

		//is the mouse/pointer/touch hovering over/moving over either pad? 
		switch (true) {
			case (pad1Here && pad1Here.active):
				activePad = -1;
				break;
			case (pad2Here && pad2Here.active):
				activePad = 1;
				break;
			default:
				activePad = 0;
		}

		// show or hide the dragged block - will only display on current active pad
		if (activePad < 0) {
			group1.addEntitysToGroup(currentEntity.name);
			group2.removeEntitysFromGroup(currentEntity.name);
		}
		else if (activePad > 0) {
			group2.addEntitysToGroup(currentEntity.name);
			group1.removeEntitysFromGroup(currentEntity.name);
		}
		else {
			group1.removeEntitysFromGroup(currentEntity.name);
			group2.removeEntitysFromGroup(currentEntity.name);
		}

		//change the background color of the current active pad
		scrawl.cell[pad1.base].set({
			backgroundColor: (activePad < 0) ? 'lightblue' : 'white'
		});
		scrawl.cell[pad2.base].set({
			backgroundColor: (activePad > 0) ? 'lightblue' : 'white'
		});
	};
	endMove = function(e) {
		stopE(e);
		setActivePad(e);
		if (currentEntity) {
			currentEntity.dropEntity();
			//to fix the case where mouse/pointer/touch ends outside of any canvas element
			if (activePad === 0) {
				currentEntity.set({
					startX: 'center',
					startY: 'center',
					handleX: 'center',
					handleY: 'center'
				});
				//dump misplaced blocks in the top pad
				group2.removeEntitysFromGroup(currentEntity.name);
				group1.addEntitysToGroup(currentEntity.name);
			}
			currentEntity = false;
		}
	};
	startMove = function(e) {
		endMove(e); //to fix the case where mouse/pointer/touch ends outside of the browser window
		currentEntity = (e.target.id === 'canvas1') ? group1.getEntityAt(pad1Here) : group2.getEntityAt(pad2Here);
		if (currentEntity) {
			currentEntity.pickupEntity((activePad < 0) ? pad1Here : pad2Here);
		}
	};
	continueMove = function(e) {
		stopE(e);
		setActivePad(e);
	};
	scrawl.addListener('up', endMove, [document.body, scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('down', startMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener(['move', 'enter', 'leave'], continueMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);

	//animation object
	scrawl.makeAnimation({
		fn: function() {

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
	extensions: ['animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
