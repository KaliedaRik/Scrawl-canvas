var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var points = ['star_p2', 'star_p4', 'star_p6', 'star_p8', 'star_p10'],
		dRadius = 2,
		minRad = 20,
		maxRad = 80,
		radius = 80,
		dRoll = 1,
		myFender,
		myGroup,
		result = false,
		checkBounds,
		animateStar,
		fieldBall,
		myBall,
		myEntity,
		updateTimer,
		dTime,
		tkr;

	//set out the field within which the entity will move
	scrawl.cell[scrawl.pad.mycanvas.base].set({
		backgroundColor: 'rgba(0,127,0,0.2)',
	});
	scrawl.newBlock({
		startX: 50,
		startY: 50,
		width: 650,
		height: 275,
		method: 'draw',
		strokeStyle: 'green',
		order: 10,
		field: true,
	}).clone({ //field attribute not retained by entity, so cloned entity not part of field
		method: 'fill',
		fillStyle: 'white',
		order: 0,
	});
	//add some fences in the field which entity will not be able to cross
	scrawl.newWheel({
		startX: 500,
		startY: 125,
		radius: 50,
		startAngle: -45,
		endAngle: -135,
		method: 'fillDraw',
		strokeStyle: 'green',
		fillStyle: 'rgba(0,127,0,0.2)',
		fence: true,
		order: 10,
	}).clone({
		startX: 255,
		fence: true,
	}).clone({
		startX: 375,
		radius: 30,
		fence: true,
	});
	scrawl.makeLine({
		startX: 250,
		startY: 125,
		endX: 500,
		endY: 125,
		lineWidth: 15,
		lineCap: 'round',
		method: 'draw',
		strokeStyle: 'rgba(0,127,0,0.2)',
		fence: true,
		order: 10,
	}).clone({
		startY: 250,
		fence: true,
	});
	//build the field/fences collision array
	scrawl.buildFields();

	//define physics entitys
	fieldBall = scrawl.newParticle({
		mass: 1000000,
	});
	myBall = scrawl.newParticle({
		name: 'ball',
		startX: 100,
		startY: 100,
		deltaX: 100,
		deltaY: -80,
		mass: 0.5,
		radius: 0.2,
	});

	//define displayed entitys
	myEntity = scrawl.makeRegularShape({
		name: 'star',
		lineWidth: 5,
		lineJoin: 'round',
		lineCap: 'round',
		strokeStyle: 'red',
		fillStyle: 'blue',
		method: 'fillDraw',
		miterLimit: 5,
		radius: 80,
		sides: 10,
		order: 1,
		pivot: 'ball',
	});
	myFender = scrawl.newWheel({
		name: 'fender',
		radius: 11,
		lineWidth: 2,
		strokeStyle: 'gold',
		method: 'draw',
		order: 2,
		collisionPoints: 12,
		pivot: 'ball',
	});
	myGroup = scrawl.newGroup({
		name: 'colgroup',
		visibility: false,
		entitys: ['fender'],
	});

	//physics update function
	updateTimer = function() {
		dTime = Date.now() - tkr;
		dTime = (dTime > 10) ? 10 : dTime;
		tkr = Date.now();
		scrawl.physics.deltaTime = dTime / 1000;
	};

	//animation functions
	checkBounds = function() {
		myFender.setDelta({
			scale: (myFender.scale + 0.01 <= 1) ? 0.01 : 0,
		});
		result = myGroup.getFieldEntityHits();
		if (result.length > 0) {
			myFender.setDelta({
				scale: (myFender.scale > 0.8) ? -0.03 : 0,
			});
			myBall.revert();
			myBall.linearCollide(fieldBall.set({
				startX: result[0][1].x,
				startY: result[0][1].y,
			}));
		}
	};
	animateStar = function() {
		if (!scrawl.isBetween((radius + dRadius), maxRad, minRad)) {
			dRadius = -dRadius;
		}
		radius += dRadius;
		for (var j = 0, z = points.length; j < z; j++) {
			scrawl.point[points[j]].set({
				distance: radius,
			});
		}
		myEntity.setDelta({
			roll: dRoll,
		});
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			updateTimer();
			checkBounds();
			animateStar();
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
	modules: ['animation', 'block', 'wheel', 'path', 'factories', 'collisions', 'physics'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
