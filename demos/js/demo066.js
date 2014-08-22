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
		currentSprite,
		group1,
		group2,
		pickupSprite,
		dropSprite,
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

	//define sprites
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
	pickupSprite = function(e) {
		currentSprite = group1.getSpriteAt(pad1Here) || group2.getSpriteAt(pad2Here);
		if (currentSprite) {
			currentSprite.pickupSprite((pad1Here.active) ? pad1Here : pad2Here);
		}
		e.stopPropagation();
		e.preventDefault();
	};
	dropSprite = function(e) {
		if (currentSprite) {
			currentSprite.dropSprite();
			currentSprite = false;
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
	scrawl.canvas.canvas1.addEventListener('mousedown', pickupSprite, false);
	scrawl.canvas.canvas1.addEventListener('dragenter', dragenter, false);
	scrawl.canvas.canvas1.addEventListener('dragover', dragover, false);
	scrawl.canvas.canvas2.addEventListener('mousedown', pickupSprite, false);
	scrawl.canvas.canvas2.addEventListener('dragenter', dragenter, false);
	scrawl.canvas.canvas2.addEventListener('dragover', dragover, false);
	document.body.addEventListener('mouseup', dropSprite, false);
	document.body.addEventListener('mouseleave', dropSprite, false);

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
			if (currentSprite) {
				if (scrawl.contains(group1.sprites, currentSprite.name)) {
					if (pad2Here.active) {
						group1.removeSpritesFromGroup(currentSprite.name);
						group2.addSpritesToGroup(currentSprite.name);
					}
				}
				else if (scrawl.contains(group2.sprites, currentSprite.name)) {
					if (pad1Here.active) {
						group2.removeSpritesFromGroup(currentSprite.name);
						group1.addSpritesToGroup(currentSprite.name);
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
