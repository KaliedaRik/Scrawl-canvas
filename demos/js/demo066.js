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
		pad1Here,
		pad2Here,
		currentEntity,
		group1,
		group2,
		pickupEntity,
		dropEntity,
		dragenter,
		dragover;

	//add canvases to page
	pad1 = scrawl.addCanvasToPage({
		canvasName: 'canvas1',
		parentElement: 'canvas1Host',
		width: 400,
		height: 200,
	});
	pad2 = scrawl.addCanvasToPage({
		canvasName: 'canvas2',
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
	pickupEntity = function(e) {
		currentEntity = group1.getEntityAt(pad1Here) || group2.getEntityAt(pad2Here);
		if (currentEntity) {
			currentEntity.pickupEntity((pad1Here.active) ? pad1Here : pad2Here);
		}
		e.stopPropagation();
		e.preventDefault();
	};
	dropEntity = function(e) {
		if (currentEntity) {
			currentEntity.dropEntity();
			currentEntity = false;
		}
		e.stopPropagation();
		e.preventDefault();
	};
	dragenter = function(e) {
		e.stopPropagation();
		e.preventDefault();
	};
	dragover = function(e) {
		e.stopPropagation();
		e.preventDefault();
	};
	scrawl.canvas.canvas1.addEventListener('mousedown', pickupEntity, false);
	scrawl.canvas.canvas1.addEventListener('dragenter', dragenter, false);
	scrawl.canvas.canvas1.addEventListener('dragover', dragover, false);
	scrawl.canvas.canvas2.addEventListener('mousedown', pickupEntity, false);
	scrawl.canvas.canvas2.addEventListener('dragenter', dragenter, false);
	scrawl.canvas.canvas2.addEventListener('dragover', dragover, false);
	document.body.addEventListener('mouseup', dropEntity, false);
	document.body.addEventListener('mouseleave', dropEntity, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			pad1Here = pad1.getMouse();
			pad2Here = pad2.getMouse();
			scrawl.cell[pad1.base].set({
				backgroundColor: (pad1Here.active) ? 'lightblue' : 'white',
			});
			scrawl.cell[pad2.base].set({
				backgroundColor: (pad2Here.active) ? 'lightblue' : 'white',
			});
			if (currentEntity) {
				if (scrawl.contains(group1.entitys, currentEntity.name)) {
					if (pad2Here.active) {
						group1.removeEntitysFromGroup(currentEntity.name);
						group2.addEntitysToGroup(currentEntity.name);
					}
				}
				else if (scrawl.contains(group2.entitys, currentEntity.name)) {
					if (pad1Here.active) {
						group2.removeEntitysFromGroup(currentEntity.name);
						group1.addEntitysToGroup(currentEntity.name);
					}
				}
			}
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
