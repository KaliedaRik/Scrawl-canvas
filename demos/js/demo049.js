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
		here,
		myEntity = false,
		entityList = ['Air', 'Bone', 'Clay', 'Fire', 'Metal', 'Radiance', 'Rock', 'Smoke', 'Water', 'Wood'],
		myGroup,
		getIcon,
		dropIcon,
		stopE;

	//import inmages into scrawl library
	scrawl.getImagesByClass('demo049');

	//define group
	myGroup = scrawl.newGroup({
		name: 'myGroup',
	});

	//define entitys; get their image data
	for (var i = 0, z = entityList.length; i < z; i++) {
		scrawl.newPicture({
			name: entityList[i],
			source: 'button' + entityList[i],
			startX: (i * 58) + 85,
			startY: 187.5,
			order: i,
			method: 'fill',
			group: 'myGroup',
			checkHitUsingImageData: true,
		});
	}

	//event listeners
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	getIcon = function(e) {
		stopE(e);
		myEntity = myGroup.getEntityAt(here);
		if (myEntity) {
			myEntity.pickupEntity(here);
		}
	};
	dropIcon = function(e) {
		stopE(e);
		if (myEntity) {
			myEntity.dropEntity();
			myEntity = false;
		}
	};
	scrawl.addListener('down', getIcon, scrawl.canvas.mycanvas);
	scrawl.addListener('up', dropIcon, scrawl.canvas.mycanvas);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (!here.active && myEntity) {
				dropIcon();
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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
