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
		details = false,
		myPic,
		myPicPath,
		myEntity,
		mySpeed = 0,
		items = [
          'angelfish', 'blackbutterfly', 'cagedparrot', 'capuchin', 'greenparrot',
          'ibis', 'kookaburra', 'peacock', 'pelican', 'pinkcockatoo',
          'swallowtail', 'swan', 'tabbycats', 'terrapin', 'turkey'
        ],
		myGroup,
		myReflections,
		carousel,
		selectImage,
		unselectImage,
		checkClick,
		updateCarousel;

	//set background color for canvas
	scrawl.cell[myPad.base].set({
		backgroundColor: 'black'
	});

	//import images into scrawl library
	scrawl.getImagesByClass('demo062');

	//define groups
	myGroup = scrawl.makeGroup({
		name: 'myGroup',
		order: 2
	});
	myReflections = scrawl.makeGroup({
		name: 'myReflections',
		order: 1
	});

	//define entitys - carousel
	carousel = scrawl.makeEllipse({
		name: 'carousel',
		startX: 375,
		startY: 200,
		radiusX: 300,
		radiusY: 100,
		method: 'none'
	}).stamp();

	//define entitys - display photos
	for (var i = 0, z = items.length; i < z; i++) {
		scrawl.makePicture({
			name: items[i],
			group: 'myGroup',
			source: items[i],
			width: 150,
			height: 100,
			strokeStyle: 'Gold',
			lineJoin: 'round',
			method: 'fillDraw',
			path: 'carousel',
			pathPlace: i / z,
			pathSpeedConstant: false,
			handleX: 'center',
			handleY: '101%'
		}).clone({
			//and their reflections
			name: items[i] + '_r',
			group: 'myReflections',
			globalAlpha: 0.32,
			flipUpend: true
		});
	}

	//event listener and associated functions
	selectImage = function() {
		myPic = myGroup.getEntityAt(here);
		if (myPic) {
			myPicPath = myPic.path;
			details = true;
			myPic.set({
				startX: 375,
				startY: 187.5,
				path: false,
				scale: 3.7,
				order: 1000,
				handleY: 'center'
			});
			scrawl.entity[myPic.name + '_r'].set({
				visibility: false
			});
			scrawl.render();
		}
	};
	unselectImage = function() {
		if (myPic) {
			myPic.set({
				handleY: '101%',
				path: myPicPath
			});
			scrawl.entity[myPic.name + '_r'].set({
				visibility: true
			});
		}
		details = false;
		myPic = false;
		myPicPath = false;
	};
	checkClick = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (details) {
			unselectImage();
		}
		else {
			selectImage();
		}
	};
	scrawl.addListener('up', checkClick, scrawl.canvas.mycanvas);

	//animation function
	updateCarousel = function() {
		var i, iz;
		if (!details) {
			mySpeed = -((here.x - 375) / 170000);
			for (i = 0, iz = items.length; i < iz; i++) {
				myEntity = scrawl.entity[items[i]];
				myEntity.set({
					scale: (myEntity.start.y / 250) + 0.5,
					order: Math.floor(myEntity.start.y),
					deltaPathPlace: mySpeed
				});
				myEntity = scrawl.entity[items[i] + '_r'];
				myEntity.set({
					scale: (myEntity.start.y / 250) + 0.5,
					order: Math.floor(myEntity.start.y),
					deltaPathPlace: mySpeed
				});
			}
			myGroup.updateStart();
			myReflections.updateStart();
		}
		myReflections.sortEntitys(true);
		myGroup.sortEntitys(true);
		myPad.clear();
		for (i = 0, iz = items.length; i < iz; i++) {
			scrawl.entity[myReflections.entitys[i]].stamp('clearWithBackground');
			scrawl.entity[myReflections.entitys[i]].stamp();
			scrawl.entity[myGroup.entitys[i]].stamp();
		}
		myPad.show();
	};

	//initial display of carousel - for safari
	here = {
		x: 350,
		y: 187.5,
		active: true
	};
	updateCarousel();
	updateCarousel();

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				updateCarousel();
			}

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'animation', 'path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
