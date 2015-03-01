var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//setup variables
	var here,
		myWheels,
		myStars,
		myColor,
		wheelStamp,
		makeSomeWheels,
		starStamp,
		makeSomeStars,
		updateCells,
		checkForSplice,
		dx,
		dy,
		starSpeed = 8,
		wheelSpeed = 5;

	//add background cells to pad
	scrawl.addNewCell({
		name: 'wheelBackground',
		width: 850,
		height: 480,
		copyX: 25,
		copyY: 25,
		copyWidth: 750,
		copyHeight: 380,
		pasteX: 0,
		pasteY: 0,
		pasteWidth: 750,
		pasteHeight: 380,
		showOrder: 2,
	});
	scrawl.addNewCell({
		name: 'starBackground',
		width: 850,
		height: 480,
		backgroundColor: 'lightblue',
		copyX: 25,
		copyY: 25,
		copyWidth: 750,
		copyHeight: 380,
		pasteX: 0,
		pasteY: 0,
		pasteWidth: 750,
		pasteHeight: 380,
		showOrder: 1,
	});
	myWheels = scrawl.cell.wheelBackground;
	myStars = scrawl.cell.starBackground;
	scrawl.render();

	//finish drawing the background cells by adding wheels and stars to them
	myColor = scrawl.makeColor({
		aMin: 0.4,
		aMax: 0.7,
		rMax: 200,
		gMax: 200,
		bMax: 200,
	});
	wheelStamp = scrawl.makeWheel({
		group: 'wheelBackground',
		method: 'fill',
	});
	makeSomeWheels = function() {
		for (var i = 0; i < 10; i++) {
			wheelStamp.set({
				startX: Math.floor((Math.random() * 650) + 100),
				startY: Math.floor((Math.random() * 280) + 100),
				radius: Math.floor((Math.random() * 70) + 30),
				fillStyle: myColor.get('random'),
			}).stamp();
		}
	};
	makeSomeWheels();
	//this splice ensures background cell has matching edges
	myWheels.spliceCell({
		edge: 'horizontal'
	}).spliceCell({
		edge: 'vertical'
	});
	makeSomeWheels();

	starStamp = scrawl.makeRegularShape({
		angle: 144,
		radius: 10,
		group: 'starBackground',
		method: 'fill',
	});
	makeSomeStars = function() {
		for (var i = 0; i < 20; i++) {
			starStamp.set({
				startX: Math.floor((Math.random() * 650) + 100),
				startY: Math.floor((Math.random() * 280) + 100),
				scale: (Math.random() * 1.5) + 0.5,
				roll: Math.floor(Math.random() * 72),
				fillStyle: myColor.get('random'),
			}).stamp();
		}
	};
	makeSomeStars();
	myStars.spliceCell({
		edge: 'horizontal'
	}).spliceCell({
		edge: 'vertical'
	});
	makeSomeStars();

	myWheels.set({
		cleared: false,
		compiled: false,
	});
	myStars.set({
		cleared: false,
		compiled: false,
	});

	//cell animation function
	updateCells = function() {
		dx = (here.x - 375) / 375;
		dy = (here.y - 190) / 190;
		myWheels.set({
			copyDeltaX: dx * wheelSpeed,
			copyDeltaY: dy * wheelSpeed,
		});
		checkForSplice(myWheels);
		myWheels.updateStart('copy');

		myStars.set({
			copyDeltaX: dx * starSpeed,
			copyDeltaY: dy * starSpeed,
		});
		checkForSplice(myStars);
		myStars.updateStart('copy');
	};

	//splice checker function called by cell animation function
	checkForSplice = function(cell) {
		var x = cell.copyDelta.x,
			y = cell.copyDelta.y,
			sx = cell.copy.x,
			sy = cell.copy.y,
			sw = cell.copyWidth,
			sh = cell.copyHeight,
			aw = cell.actualWidth,
			ah = cell.actualHeight;
		if (sx + x < 0) {
			cell.spliceCell({
				edge: 'right',
				strip: 100,
				shiftCopy: true,
			});
		}
		else if (sx + sw + x > aw) {
			cell.spliceCell({
				edge: 'left',
				strip: 100,
				shiftCopy: true,
			});
		}
		if (sy + y < 0) {
			cell.spliceCell({
				edge: 'bottom',
				strip: 100,
				shiftCopy: true,
			});
		}
		else if (sy + sh + y > ah) {
			cell.spliceCell({
				edge: 'top',
				strip: 100,
				shiftCopy: true,
			});
		}
	};

	//display initial scene
	scrawl.show();

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = scrawl.pad.mycanvas.getMouse();
			if (here.active) {
				updateCells();
				//display cycle reduced to show component
				scrawl.show();
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
	modules: ['color', 'factories', 'wheel', 'path', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
