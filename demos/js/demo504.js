var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myCanvas = scrawl.canvas.mycanvas,
		here = false,
		currentObject = false,
		clickedObject,
		myCol,
		myGroup = scrawl.group[myPad.base],
		handleSprite;

	//import images into scrawl library
	scrawl.getImagesByClass('demo504');

	//define designs (gradients, colors)
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
		roll: 0.002,
		setToSprite: true,
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

	//define animation sheets
	scrawl.newAnimSheet({
		name: 'mytiger',
		sheet: 'tiger',
		running: 'forward',
		loop: 'loop',
		frames: [{
			x: (120 * 0),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 1),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 2),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 3),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }, {
			x: (120 * 4),
			y: (66 * 1),
			w: 120,
			h: 66,
			d: 100,
        }],
	});

	//define sprites
	scrawl.makeRegularShape({
		startX: 420,
		startY: 100,
		angle: 144,
		radius: 50,
		winding: 'evenodd',
		fillStyle: 'myRed',
		order: myGroup.sprites.length,
		method: 'fillDraw',
	});

	scrawl.newPicture({
		source: 'angelfish',
		strokeStyle: 'Gold',
		lineWidth: 3,
		method: 'fillDraw',
		width: 150,
		height: 100,
		order: myGroup.sprites.length,
		shadowBlur: 4,
		shadowColor: 'Black',
		startX: 80,
		startY: 50,
	});

	scrawl.newBlock({
		strokeStyle: 'Orange',
		fillStyle: 'myBlue',
		lineWidth: 6,
		method: 'fillDraw',
		order: myGroup.sprites.length,
		width: 100,
		height: 100,
		startX: 300,
		startY: 200,
		lineDash: [20, 5],
	});

	scrawl.newWheel({
		strokeStyle: '#800',
		fillStyle: 'gradient',
		lineWidth: 6,
		method: 'fillDraw',
		radius: 40,
		startX: 600,
		startY: 90,
		lineDash: [20, 5, 5, 5],
		order: myGroup.sprites.length,
	});

	scrawl.newPicture({
		name: 'cat',
		startX: 100,
		startY: 300,
		method: 'fill',
		source: 'tiger',
		animSheet: 'mytiger',
		order: myGroup.sprites.length,
		checkHitUsingImageData: true,
		handleX: 'center',
		handleY: 'center',
		flipReverse: true,
		roll: 10,
	}).getImageData();

	scrawl.newPhrase({
		method: 'fill',
		order: myGroup.sprites.length,
		text: 'No! Clone me! Me!',
		startX: 500,
		startY: 300,
		font: '20pt Arial, Helvetica',
	});

	//event listener
	handleSprite = function(e) {
		var i, iz, a, b, r;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		clickedObject = myGroup.getSpriteAt(here);
		if (clickedObject) {
			if (clickedObject.name === 'cat') {
				a = clickedObject.toString();
				b = scrawl.save('animsheets');
				r = '';
				for (i = 0, iz = a.length; i < iz; i++) {
					r += a[i].replace(',', ', ', 'g');
					r += '<br />';
				}
				r += '&nbsp;<br />(AnimSheet data has to be saved separately, using <b>scrawl.save(\'animsheets\')</b>)<br />';
				for (i = 0, iz = b.length; i < iz; i++) {
					r += b[i].replace(',', ', ', 'g');
					r += '<br />';
				}
				document.getElementById('out').innerHTML = r;
			}
			else {
				a = clickedObject.toString();
				r = '';
				for (i = 0, iz = a.length; i < iz; i++) {
					r += a[i].replace(',', ', ', 'g');
					r += '<br />';
				}
				document.getElementById('out').innerHTML = r;
			}
			myPad.setDisplayOffsets();
		}
	};
	myCanvas.addEventListener('mouseup', handleSprite, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			for (var i = 0, z = myGroup.sprites.length; i < z; i++) {
				if (scrawl.sprite[myGroup.sprites[i]].type === 'Path') {
					scrawl.sprite[myGroup.sprites[i]].setDelta({
						roll: 0.5,
					});
				}
				if (scrawl.sprite[myGroup.sprites[i]].type === 'Block') {
					scrawl.sprite[myGroup.sprites[i]].setDelta({
						lineDashOffset: (i % 2 === 0) ? 0.1 : -0.1,
					});
				}
				if (scrawl.sprite[myGroup.sprites[i]].type === 'Wheel') {
					scrawl.sprite[myGroup.sprites[i]].setDelta({
						roll: (i % 2 === 0) ? 0.2 : -0.2,
					});
				}
			}
			if (here.active) {
				myCanvas.style.cursor = (myGroup.getSpriteAt(here)) ? 'pointer' : 'auto';
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['saveload', 'animation', 'block', 'wheel', 'phrase', 'path', 'factories', 'images', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
