var mycode = function() {
	'use strict';
	var ticker = Date.now(),
		sTime = ticker,
		now,
		msg = document.getElementById('msg');

	//define variables
	var pad = scrawl.pad.mycanvas,
		tkr = Date.now(),
		dTime = 0,
		group,
		pBall,
		fieldBall,
		dWheel,
		updateTimer,
		getColor,
		inflateBalls,
		checkBounds,
		checkCollisions;

	//define groups
	group = scrawl.newGroup({
		name: 'colsGroup',
	});

	//define cell collision zone
	scrawl.newBlock({
		startX: 10.5,
		startY: 10.5,
		width: 580,
		height: 580,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.newWheel({
		radius: 90,
		startX: 300,
		startY: 300,
		fence: true,
	});
	scrawl.makeLine({
		startX: 50,
		startY: 300,
		endX: 300,
		endY: 500,
		lineCap: 'round',
		lineWidth: 10,
		lineDash: [60, 40],
		fence: true,
		shape: true,
	});
	scrawl.buildFields();

	//add attributes to the physics object
	scrawl.physics.windSpeed = 40;
	scrawl.physics.jetSpeed = 300;

	//define physics objects - forces
	scrawl.newForce({
		name: 'wind',
		fn: function(ball) {
			var c = 0.5 * scrawl.physics.airDensity * scrawl.physics.windSpeed * scrawl.physics.windSpeed,
				wind = scrawl.workphys.v1.set({
					x: c * ball.get('area') * ball.get('drag'),
					y: 0,
					z: 0,
				});
			ball.load.vectorAdd(wind);
		},
	});
	scrawl.newForce({
		name: 'jet',
		fn: function(ball) {
			if (scrawl.sprite.jet.checkHit(ball.place)) {
				var c = 0.5 * scrawl.physics.airDensity * scrawl.physics.jetSpeed * scrawl.physics.jetSpeed,
					j = c * ball.get('area') * ball.get('drag'),
					wind = scrawl.workphys.v1.set({
						x: j,
						y: j,
					}),
					effect = scrawl.workphys.v2.set({
						x: (1 - ((scrawl.sprite.jet.start.x - ball.place.x) / scrawl.sprite.jet.radius)) * 0.1,
						y: 1 - ((scrawl.sprite.jet.start.y - ball.place.y) / scrawl.sprite.jet.radius),
					});
				wind.vectorMultiply(effect).reverse();
				ball.load.vectorAdd(wind);
			}
		},
	});

	fieldBall = scrawl.newParticle({
		mass: 1000000,
		elasticity: 1.21,
	});

	pBall = scrawl.newParticle({
		name: 'pBall_0',
		startX: 30,
		startY: 30,
		mass: 0.5 + Math.random(),
		elasticity: 0.8,
		radius: 0.02,
	});
	pBall.addForce('gravity').addForce('drag').addForce('wind').addForce('jet');

	//define sprites
	scrawl.newWheel({
		name: 'jet',
		startX: 590,
		startY: 600,
		startAngle: -120,
		endAngle: -90,
		radius: 250,
		method: 'fillDraw',
		fillStyle: '#ffcccc',
		includeCenter: true,
		checkHitUsingRadius: false,
	});

	getColor = function(mass) { //ball color generator function
		return 'rgb(0,' + (255 - (Math.floor(mass * 160))) + ',' + (255 - (Math.floor(mass * 160))) + ')';
	};

	dWheel = scrawl.newWheel({
		name: 'dWheel_0',
		pivot: 'pBall_0',
		group: 'colsGroup',
		radius: 10,
		collisionPoints: 'perimeter',
		method: 'fillDraw',
		fillStyle: getColor(scrawl.sprite.pBall_0.get('mass')),
		strokeStyle: 'orange',
	});

	for (var i = 1; i < 19; i++) {
		pBall.clone({
			name: 'pBall_' + i,
			startX: 30 + (i * 30),
			mass: 0.5 + Math.random(),
		});
		dWheel.clone({
			name: 'dWheel_' + i,
			pivot: 'pBall_' + i,
			fillStyle: getColor(scrawl.sprite['pBall_' + i].get('mass')),
		});
	}

	//physics update function
	updateTimer = function() {
		dTime = Date.now() - tkr;
		dTime = (dTime > 10) ? 10 : dTime;
		tkr = Date.now();
		scrawl.physics.deltaTime = dTime / 1000;
	};

	inflateBalls = function() {
		var w;
		for (var i = 0, z = group.sprites.length; i < z; i++) {
			w = scrawl.sprite[group.sprites[i]];
			w.setDelta({
				scale: (w.scale + 0.01 <= 1) ? 0.01 : 0,
			});
		}
	};

	//animation functions
	checkBounds = function() {
		var hits = group.getFieldSpriteHits(),
			b1,
			w1;
		for (var i = 0, z = hits.length; i < z; i++) {
			w1 = scrawl.sprite[hits[i][0]];
			w1.setDelta({
				scale: (w1.scale > 0.8) ? -0.03 : 0,
			});
			b1 = scrawl.sprite[w1.pivot];
			b1.revert();
			b1.linearCollide(fieldBall.set({
				startX: hits[i][1].x,
				startY: hits[i][1].y,
			}));
		}
	};

	checkCollisions = function() {
		var hits = group.getInGroupSpriteHits(),
			b1,
			b2,
			w1,
			w2;
		for (var i = 0, z = hits.length; i < z; i++) {
			w1 = scrawl.sprite[hits[i][0]];
			w2 = scrawl.sprite[hits[i][1]];
			w1.setDelta({
				scale: (w1.scale > 0.8) ? -0.03 : 0,
			});
			w2.setDelta({
				scale: (w2.scale > 0.8) ? -0.03 : 0,
			});
			b1 = scrawl.sprite[w1.pivot];
			b2 = scrawl.sprite[w2.pivot];
			b1.linearCollide(b2);
		}
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			updateTimer();
			inflateBalls();
			checkCollisions();
			checkBounds();
			pad.render();

			now = Date.now();
			sTime = now - ticker;
			ticker = now;
			msg.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(sTime) + '; fps: ' + Math.floor(1000 / sTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['factories', 'shape', 'physics', 'wheel', 'block', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
