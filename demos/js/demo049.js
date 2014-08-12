var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myPad = scrawl.pad.mycanvas,
		here,
		mySprite = false,
		spriteList = ['Air', 'Bone', 'Clay', 'Fire', 'Metal', 'Radiance', 'Rock', 'Smoke', 'Water', 'Wood'],
		myGroup,
		getIcon,
		dropIcon;

	//import inmages into scrawl library
	scrawl.getImagesByClass('demo049');

	//define group
	myGroup = scrawl.newGroup({
		name: 'myGroup',
	});

	//define sprites; get their image data
	for (var i = 0, z = spriteList.length; i < z; i++) {
		scrawl.newPicture({
			name: spriteList[i],
			source: 'button' + spriteList[i],
			startX: (i * 58) + 85,
			startY: 187.5,
			order: i,
			method: 'fill',
			group: 'myGroup',
			checkHitUsingImageData: true,
		}).getImageData();
	}

	//event listeners
	getIcon = function(e) {
		mySprite = myGroup.getSpriteAt(here);
		if (mySprite) {
			mySprite.pickupSprite(here);
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	dropIcon = function(e) {
		if (mySprite) {
			mySprite.dropSprite();
			mySprite = false;
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	scrawl.canvas.mycanvas.addEventListener('mousedown', getIcon, false);
	scrawl.canvas.mycanvas.addEventListener('mouseup', dropIcon, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (!here.active && mySprite) {
				dropIcon();
			}
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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
