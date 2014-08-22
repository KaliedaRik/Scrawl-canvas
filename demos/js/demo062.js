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
		mySprite,
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
		backgroundColor: 'black',
	});

	//import images into scrawl library
	scrawl.getImagesByClass('demo062');

	//define groups
	myGroup = scrawl.newGroup({
		name: 'myGroup',
		order: 2,
	});
	myReflections = scrawl.newGroup({
		name: 'myReflections',
		order: 1,
	});

	//define sprites - carousel
	carousel = scrawl.makeEllipse({
		name: 'carousel',
		startX: 375,
		startY: 200,
		radiusX: 300,
		radiusY: 100,
		method: 'none',
	});

	//define sprites - display photos
	for (var i = 0, z = items.length; i < z; i++) {
		scrawl.newPicture({
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
			handleY: '101%',
		}).clone({
			//and their reflections
			name: items[i] + '_r',
			group: 'myReflections',
			globalAlpha: 0.32,
			flipUpend: true,
		});
	}

	//event listener and associated functions
	selectImage = function() {
		myPic = myGroup.getSpriteAt(here);
		if (myPic) {
			myPicPath = myPic.path;
			details = true;
			myPic.set({
				startX: 375,
				startY: 187.5,
				path: false,
				scale: 3.7,
				order: 1000,
				handleY: 'center',
			});
			scrawl.sprite[myPic.name + '_r'].set({
				visibility: false,
			});
			scrawl.render();
		}
	};
	unselectImage = function() {
		if (myPic) {
			myPic.set({
				handleY: '101%',
				path: myPicPath,
			});
			scrawl.sprite[myPic.name + '_r'].set({
				visibility: true,
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
	scrawl.canvas.mycanvas.addEventListener('mouseup', checkClick, false);

	//animation function
	updateCarousel = function() {
		var i, iz;
		if (!details) {
			mySpeed = -((here.x - 375) / 170000);
			for (i = 0, iz = items.length; i < iz; i++) {
				mySprite = scrawl.sprite[items[i]];
				mySprite.set({
					scale: (mySprite.start.y / 250) + 0.5,
					order: mySprite.start.y,
					deltaPathPlace: mySpeed,
				});
				mySprite = scrawl.sprite[items[i] + '_r'];
				mySprite.set({
					scale: (mySprite.start.y / 250) + 0.5,
					order: mySprite.start.y,
					deltaPathPlace: mySpeed,
				});
			}
			myGroup.updateStart();
			myReflections.updateStart();
		}
		myReflections.sortSprites();
		myGroup.sortSprites();
		myPad.stampBackground();
		for (i = 0, iz = items.length; i < iz; i++) {
			scrawl.sprite[myReflections.sprites[i]].stamp('clearWithBackground');
			scrawl.sprite[myReflections.sprites[i]].stamp();
			scrawl.sprite[myGroup.sprites[i]].stamp();
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
	scrawl.newAnimation({
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation', 'path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
