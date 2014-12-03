var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var groundSpeed = 3.2,
		myGround,
		myGroundCell,
		groundEntity,
		skySpeed = 2.8,
		mySky,
		mySkyCell,
		skyEntity,
		catSpeed = 1,
		myCat;

	//load images into library
	scrawl.getImagesByClass('demo206');

	//add a stack to the web page
	scrawl.addStackToPage({
		stackName: 'catstack',
		parentElement: 'stackholder',
		//overflow: 'hidden',
		width: 1000,
		height: 500,
		perspectiveY: 270,
		perspectiveZ: 400,
	});

	//add three new canvases/pads to the stack
	mySky = scrawl.addCanvasToPage({
		name: 'sky',
		stackName: 'catstack',
		width: 1000,
		height: 280,
		backgroundColor: '#b3f3ec',
		title: 'Background canvas',
		handleY: 'bottom',
		startY: 280,
		pitch: 45,
	});
	myGround = scrawl.addCanvasToPage({
		name: 'ground',
		stackName: 'catstack',
		width: 1000,
		height: 350,
		handleY: 'top',
		startY: 280,
		pitch: 80,
		title: 'canvas showing scrolled 3d ground',
		position: 'relative',
	});
	myCat = scrawl.addCanvasToPage({
		name: 'catCanvas',
		stackName: 'catstack',
		width: 300,
		height: 150,
		//necessary for Safari, which only shows the cat if it is 'in front of' the scenery
		translateZ: 150,
		handleX: 'center',
		handleY: '65%',
		startX: 'center',
		startY: 'center',
		title: 'Canvas showing running cat',
	});

	//build sky canvas
	mySkyCell = mySky.addNewCell({
		name: 'skyImage',
		width: 1100,
		height: 500,
		compiled: false,
		cleared: false,
		shown: false,
	});
	scrawl.newPicture({
		name: 'temporary',
		source: 'catSky',
		width: 1100,
		height: 500,
		group: 'skyImage',
	}).stamp();
	skyEntity = scrawl.newPicture({
		source: 'skyImage',
		width: 1000,
		height: 500,
		copyWidth: 1000,
		copyHeight: 500,
		group: mySky.base,
	});

	//build ground canvas
	myGroundCell = myGround.addNewCell({
		name: 'groundImage',
		width: 1100,
		height: 500,
		compiled: false,
		cleared: false,
		shown: false
	});
	scrawl.newPicture({
		name: 'temporary',
		source: 'catGround',
		width: 1100,
		height: 500,
		group: 'groundImage',
	}).stamp();
	scrawl.deleteEntity('temporary');
	groundEntity = scrawl.newPicture({
		source: 'groundImage',
		width: 1000,
		height: 500,
		copyWidth: 1000,
		copyHeight: 500,
		group: myGround.base,
	});

	//build cat canvas
	scrawl.newSpriteAnimation({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: catSpeed,
		frames: [{
			x: 0,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, ],
	});
	scrawl.newPicture({
		width: 300,
		height: 150,
		source: 'cat',
		animation: 'animatedCat',
		group: myCat.base,
	});

	//animation objects
	scrawl.newAnimation({
		name: 'sky',
		fn: function() {
			if (skyEntity.copy.x + skySpeed >= 100) {
				mySkyCell.spliceCell({
					edge: 'left',
					strip: 100,
				});
				skyEntity.setDelta({
					copyX: -100
				});
			}
			skyEntity.setDelta({
				copyX: skySpeed
			});
		},
	});
	scrawl.newAnimation({
		name: 'ground',
		fn: function() {
			if (groundEntity.copy.x + groundSpeed >= 100) {
				myGroundCell.spliceCell({
					edge: 'left',
					strip: 100,
				});
				groundEntity.setDelta({
					copyX: -100
				});
			}
			groundEntity.setDelta({
				copyX: groundSpeed
			});
		},
	});
	scrawl.newAnimation({
		name: 'cat',
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
