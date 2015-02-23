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
		currentEntityOrigin = 0,
		startMove,
		continueMove,
		haltMove,
		resumeMove,
		endMove,
		padBackground,
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
	scrawl.newBlock({
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
	startMove = function(e) {
		stopE(e);
		pad1Here = pad1.getMouse();
		pad2Here = pad2.getMouse();
		padBackground(pad1Here, pad2Here);
		currentEntity = group1.getEntityAt(pad1Here) || group2.getEntityAt(pad2Here);
		if (currentEntity) {
			currentEntity.pickupEntity((pad1Here.active) ? pad1Here : pad2Here);
			currentEntityOrigin = (pad1Here.active) ? 1 : 2;
		}
	};
	endMove = function(e) {
		haltMove(e);
		currentEntity = false;
		currentEntityOrigin = 0;
	};
	haltMove = function(e) {
		stopE(e);
		padBackground(pad1.getMouse(), pad2.getMouse());
		if (currentEntity) {
			currentEntity.dropEntity();
		}
	};
	resumeMove = function(e) {
		stopE(e);
		pad1Here = pad1.getMouse();
		pad2Here = pad2.getMouse();
		padBackground(pad1Here, pad2Here);
		if (currentEntity) {
			if (pad1Here.active) {
				if (scrawl.contains(group2.entitys, currentEntity.name)) {
					group2.removeEntitysFromGroup(currentEntity.name);
					group1.addEntitysToGroup(currentEntity.name);
					currentEntityOrigin = 2;
				}
			}
			if (pad2Here.active) {
				if (scrawl.contains(group1.entitys, currentEntity.name)) {
					group1.removeEntitysFromGroup(currentEntity.name);
					group2.addEntitysToGroup(currentEntity.name);
					currentEntityOrigin = 1;
				}
			}
			currentEntity.pickupEntity((currentEntityOrigin === 1) ? pad1Here : pad2Here);
		}
	};
	padBackground = function(p1, p2) {
		scrawl.cell[pad1.base].set({
			backgroundColor: (p1.active) ? 'lightblue' : 'white'
		});
		scrawl.cell[pad2.base].set({
			backgroundColor: (p2.active) ? 'lightblue' : 'white'
		});
	};
	continueMove = function(e) {
		stopE(e);
		//touch events are specific to the element they started on, and not listened for by other elements
		if (e.type === 'touchmove' || e.type === 'touchfollow') {
			pad1Here = pad1.getMouse();
			pad2Here = pad2.getMouse();
			if (e.target.id === pad1.name) {
				pad1Here.fired = true;
				if ((pad2Here && !pad2Here.fired) || !pad2Here) {
					scrawl.triggerTouchFollow(e, scrawl.canvas.canvas2);
				}
				else {
					pad1Here.fired = false;
					pad2Here.fired = false;
				}
			}
			else if (e.target.id === pad2.name) {
				pad2Here.fired = true;
				if ((pad1Here && !pad1Here.fired) || !pad1Here) {
					scrawl.triggerTouchFollow(e, scrawl.canvas.canvas1);
				}
				else {
					pad1Here.fired = false;
					pad2Here.fired = false;
				}
			}
			else {
				console.log('something fucked up');
			}
		}
	};
	scrawl.addListener('down', startMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('up', endMove, [document.body, scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('move', continueMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('leave', haltMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('enter', resumeMove, [scrawl.canvas.canvas1, scrawl.canvas.canvas2]);
	scrawl.addListener('enter', endMove, document.body);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			pad1.render();
			pad2.render();

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
	modules: ['animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
