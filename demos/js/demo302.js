var mycode = function() {
	'use strict';
	//hide-start
	var ticker = Date.now(),
		sTime = ticker,
		now,
		msg = document.getElementById('msg');
	//hide-end

	//define variables
	var pad = scrawl.pad.mycanvas,
		tkr = Date.now(),
		dTime = 0,
		hits,
		myBall,
		group,
		minX = 10.5,
		minY = 10.5,
		maxX = 590.5,
		maxY = 590.5,
		pBall,
		fieldBall,
		dWheel,
		getColor,
		checkBounds,
		updateTimer;

	//define groups
	group = scrawl.makeGroup({
		name: 'colsGroup',
	});

	//add attributes to the physics object
	scrawl.physics.windSpeed = 15; //meters per second, blowing horizontally left-to-right
	scrawl.physics.jetSpeed = 300;

	//define physics objects - forces
	scrawl.makeForce({
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
	scrawl.makeForce({
		name: 'jet',
		fn: function(ball) {
			if (scrawl.entity.jet.checkHit(ball.place)) {
				var c = 0.5 * scrawl.physics.airDensity * scrawl.physics.jetSpeed * scrawl.physics.jetSpeed,
					j = c * ball.get('area') * ball.get('drag'),
					wind = scrawl.workphys.v1.set({
						x: j,
						y: j,
					}),
					effect = scrawl.workphys.v2.set({
						x: (1 - ((scrawl.entity.jet.start.x - ball.place.x) / scrawl.entity.jet.radius)) * 0.1,
						y: 1 - ((scrawl.entity.jet.start.y - ball.place.y) / scrawl.entity.jet.radius),
					});
				wind.vectorMultiply(effect).reverse();
				ball.load.vectorAdd(wind);
			}
		},
	});

	//define physics objects - template particle
	pBall = scrawl.makeParticle({
		name: 'pBall_0',
		startX: 20 + (Math.random() * 560),
		startY: 20 + (Math.random() * 100),
		mass: 0.5 + Math.random(),
		radius: 0.05,
	});
	pBall.addForce('gravity').addForce('drag').addForce('wind').addForce('jet');

	fieldBall = scrawl.makeParticle({
		mass: 1000000,
		elasticity: 1,
	});

	//define entitys
	scrawl.makeBlock({ //cell collision zone
		name: 'dFence',
		startX: 10.5,
		startY: 10.5,
		width: 580,
		height: 580,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.buildFields();

	scrawl.makeWheel({ //jet entity
		name: 'jet',
		startX: 590,
		startY: 600,
		startAngle: -120,
		endAngle: -90,
		radius: 200,
		method: 'fillDraw',
		fillStyle: '#ffcccc',
		includeCenter: true,
		checkHitUsingRadius: false,
	});

	getColor = function(mass) { //ball color generator function
		return 'rgb(0,' + (255 - (Math.floor(mass * 160))) + ',' + (255 - (Math.floor(mass * 160))) + ')';
	};

	dWheel = scrawl.makeWheel({ //display balls
		name: 'dWheel_0',
		pivot: 'pBall_0',
		group: 'colsGroup',
		radius: 10,
		collisionPoints: 'edges',
		method: 'fillDraw',
		fillStyle: getColor(scrawl.entity.pBall_0.get('mass')),
		strokeStyle: 'orange',
	});

	for (var i = 1; i < 29; i++) {
		pBall.clone({
			name: 'pBall_' + i,
			startX: 20 + (Math.random() * 560),
			startY: 20 + (Math.random() * 100),
			mass: 0.5 + Math.random(),
		});
		dWheel.clone({
			name: 'dWheel_' + i,
			pivot: 'pBall_' + i,
			fillStyle: getColor(scrawl.entity['pBall_' + i].get('mass')),
		});
	}

	//iteration function
	updateTimer = function() {
		dTime = Date.now() - tkr;
		dTime = (dTime > 10) ? 10 : dTime;
		tkr = Date.now();
		scrawl.physics.deltaTime = dTime / 1000;
	};

	//bounce function
	checkBounds = function() {
		var hits,
			b1;
		group.resetCollisionPoints();
		hits = group.getFieldEntityHits();
		for (var i = 0, iz = hits.length; i < iz; i++) {
			b1 = scrawl.entity[scrawl.entity[hits[i][0]].pivot];
			b1.revert();
			b1.linearCollide(fieldBall.set({
				startX: hits[i][1].x,
				startY: hits[i][1].y,
			}));
		}
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			checkBounds();
			updateTimer();
			pad.render();

			//hide-start
			now = Date.now();
			sTime = now - ticker;
			ticker = now;
			msg.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(sTime) + '; fps: ' + Math.floor(1000 / sTime);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'physics', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
