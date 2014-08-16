var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var pad = scrawl.pad.mycanvas,
		iGroup,
		pGroup,
		pivot,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		result,
		move;

	//import images into scrawl library
	scrawl.getImagesByClass('demo047');

	//define groups
	iGroup = scrawl.newGroup({
		name: 'iconGroup',
		order: 1,
	});
	pGroup = scrawl.newGroup({
		name: 'pivotGroup',
		order: 2,
	});

	//define sprites
	scrawl.newPicture({
		name: 'air',
		source: 'buttonAir',
		startX: 60,
		startY: 0,
		group: 'iconGroup',
	}).clone({
		name: 'bone',
		source: 'buttonBone',
		startX: 30,
		startY: 30,
	}).clone({
		name: 'clay',
		source: 'buttonClay',
		startX: 90,
		startY: 30,
	}).clone({
		name: 'fire',
		source: 'buttonFire',
		startX: 0,
		startY: 60,
	}).clone({
		name: 'metal',
		source: 'buttonMetal',
		startX: 60,
		startY: 60,
	}).clone({
		name: 'radiance',
		source: 'buttonRadiance',
		startX: 120,
		startY: 60,
	}).clone({
		name: 'rock',
		source: 'buttonRock',
		startX: 30,
		startY: 90,
	}).clone({
		name: 'smoke',
		source: 'buttonSmoke',
		startX: 90,
		startY: 90,
	}).clone({
		name: 'water',
		source: 'buttonWater',
		startX: 60,
		startY: 120,
	}).clone({
		name: 'wood',
		source: 'buttonWood',
		startX: 180,
		startY: 60,
	});

	pivot = scrawl.newWheel({
		name: 'centerpoint',
		radius: 7,
		startX: 120,
		startY: 90,
		deltaX: 3,
		deltaY: 2,
		fillStyle: 'red',
		group: 'pivotGroup',
		collisionPoints: 'start',
	});

	//set iGroup sprites' pivot attribute to pivot sprite ('centerpoint')
	iGroup.pivotSpritesTo(pivot.name);

	//build cell collision field
	scrawl.newBlock({
		startX: 50,
		startY: 50,
		width: 650,
		height: 275,
		method: 'draw',
		field: true,
	});
	scrawl.buildFields();

	//animation function
	move = function() {
		result = pivot.checkField(pad.base);
		if (typeof result !== 'boolean') {
			if (!scrawl.isBetween(result.x, minX, maxX, true)) {
				pivot.reverse('deltaX');
			}
			if (!scrawl.isBetween(result.y, minY, maxY, true)) {
				pivot.reverse('deltaY');
			}
		}
		iGroup.updateSpritesBy({
			roll: 0.8,
		});
		pivot.updateStart();
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			move();
			scrawl.render();

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
	modules: ['block', 'wheel', 'images', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});