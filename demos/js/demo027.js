var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myEntity = false,
		here,
		myPad = scrawl.pad.mycanvas,
		myGroup = scrawl.group[myPad.base],
		star,
		catchStar,
		dropStar;

	//define star entity
	star = scrawl.makeRegularShape({
		name: 'star',
		startX: 200,
		startY: 100,
		radius: 60,
		angle: 144,
		fillStyle: '#f8cd8a',
		strokeStyle: '#c4b723',
		method: 'sinkInto',
		lineWidth: 4,
		lineJoin: 'round',
		shadowBlur: 2,
		shadowOffsetX: 3,
		shadowOffsetY: 3,
		shadowColor: '#494731',
		roll: -36,
	});

	//add in some Phrase entitys
	scrawl.newPhrase({
		text: '1',
		pivot: 'star_p1',
		font: '18pt bold Arial, sans-serif',
		handleX: 'center',
		handleY: 'center',
		backgroundColor: 'rgba(200,20,50,0.3)',
		backgroundMargin: 2,
		//picking up a entity increases its order attribute by 9,999 -
		//other entitys need an order > 9,999 to appear over a picked-up entity 
		order: 10000,
	}).clone({
		text: '2',
		pivot: 'star_p2',
	}).clone({
		text: '3',
		pivot: 'star_p3',
	}).clone({
		text: '4',
		pivot: 'star_p4',
	}).clone({
		text: '5',
		pivot: 'star_p5',
	});

	//event listeners
	catchStar = function(e) {
		myEntity = myGroup.getEntityAt(here);
		if (myEntity) {
			myEntity.pickupEntity(here);
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	dropStar = function(e) {
		if (myEntity) {
			myEntity.dropEntity();
			myEntity = false;
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	scrawl.canvas.mycanvas.addEventListener('mousedown', catchStar, false);
	scrawl.canvas.mycanvas.addEventListener('mouseup', dropStar, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (!here.active && myEntity) {
				dropStar();
			}
			star.setDelta({
				roll: 1,
			});

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
	modules: ['factories', 'path', 'phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
