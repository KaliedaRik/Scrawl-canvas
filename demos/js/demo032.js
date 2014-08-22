var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var canvas = scrawl.canvas.mycanvas,
		pad = scrawl.pad.mycanvas,
		minX = 5,
		minY = 5,
		maxX = 595,
		maxY = 595,
		totalBunnies = 0,
		group,
		bunny,
		moveSprites,
		checkBounds,
		mySprite,
		hitFlag,
		moveBunnies,
		addBunnies,
		msg = document.getElementById('message');

	//load images into scrawl library
	scrawl.getImagesByClass('demo032');

	//define groups
	group = scrawl.newGroup({
		name: 'mygroup',
		spriteSort: false,
		//spriteSort=false - turns off pre-sorting of sprites before each display cycle (small speed gain)
	});

	//define sprites
	bunny = scrawl.newPicture({ //bunny sprite template
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		visibility: false,
		fastStamp: true,
		//fastStamp=true - switches off context engine updating before each sprite is stamped (large speed gain)
	});

	//animation functions
	moveSprites = function() {
		group.updateStart();
	};

	// - use manual checking instead of cell collision field checking (small speed gain)
	checkBounds = function() {
		for (var i = 0, iz = group.sprites.length; i < iz; i++) {
			hitFlag = false;
			mySprite = scrawl.sprite[group.sprites[i]];
			if (!scrawl.isBetween(mySprite.start.x, minX, maxX, true)) {
				mySprite.delta.x = -mySprite.delta.x;
				hitFlag = true;
			}
			if (!scrawl.isBetween(mySprite.start.y, minY, maxY, true)) {
				mySprite.delta.y = -mySprite.delta.y;
				hitFlag = true;
			}
			if (hitFlag) {
				mySprite.updateStart();
			}
		}
	};

	moveBunnies = function() {
		moveSprites();
		checkBounds();
	};

	//event handlers
	addBunnies = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		for (var i = 0; i < 10; i++) {
			bunny.clone({
				startX: Math.floor((Math.random() * 580) + 10),
				startY: Math.floor((Math.random() * 580) + 10),
				deltaX: Math.floor((Math.random() * 4) + 1),
				deltaY: Math.floor((Math.random() * 4) + 1),
				visibility: true,
				group: 'mygroup',
				createNewContext: false,
				//createNewContext=false - forces bunny clones to use the original bunny's context object (good speed gain)
			});
		}
		totalBunnies += 10;
	};
	canvas.addEventListener('mouseup', addBunnies, false);

	//initialize scene
	addBunnies();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveBunnies();
			pad.render();

			msg.innerHTML = 'Bunnies: ' + totalBunnies;

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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
