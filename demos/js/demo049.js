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
		myEntities = [],
		myEntitiesCheck,
		myEntity = false,
		i, iz,
		entityList = ['Air', 'Bone', 'Clay', 'Fire', 'Metal', 'Radiance', 'Rock', 'Smoke', 'Water', 'Wood'],
		myGroup,
		getIcon,
		dropIcon,
		stopE;

	//import inmages into scrawl library
	scrawl.getImagesByClass('demo049');

	//define group
	myGroup = scrawl.makeGroup({
		name: 'myGroup',
	});

	//define entitys; get their image data
	for (i = 0, iz = entityList.length; i < iz; i++) {
		scrawl.makePicture({
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
		//here is an array of mouse vectors
		here = myPad.getMouse(e);
		for (i = 0, iz = here.length; i < iz; i++) {
			myEntity = myGroup.getEntityAt(here[i]);
			if (myEntity) {
				scrawl.pushUnique(myEntities, myEntity.name);
				myEntity.pickupEntity(here[i]);
			}
		}
	};
	dropIcon = function(e) {
		stopE(e);
		if (myEntities.length > 0) {
			//here is an array of mouse vector id strings
			here = myPad.getMouseIdFromEvent(e);
			myEntitiesCheck = myEntities.slice();
			for (i = 0, iz = myEntitiesCheck.length; i < iz; i++) {
				myEntity = scrawl.entity[myEntitiesCheck[i]];
				if (scrawl.contains(here, myEntity.mouseIndex)) {
					myEntity.dropEntity();
					scrawl.removeItem(myEntities, myEntity.name);
				}
			}
		}
	};
	scrawl.addListener('down', getIcon, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], dropIcon, scrawl.canvas.mycanvas);

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
