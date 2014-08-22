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
		dWheel,
		getColor,
		checkBounds,
		updateTimer;

	//define groups
	group = scrawl.newGroup({
		name: 'colsGroup',
	});

	//add attributes to the physics object
	scrawl.physics.windSpeed = 15; //meters per second, blowing horizontally left-to-right
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

	//define physics objects - template particle
	pBall = scrawl.newParticle({
		name: 'pBall_0',
		startX: 20 + (Math.random() * 560),
		startY: 20 + (Math.random() * 100),
		mass: 0.5 + Math.random(),
		radius: 0.05,
	});
	pBall.addForce('gravity').addForce('drag').addForce('wind').addForce('jet');

	//define sprites
	scrawl.newBlock({ //cell collision zone
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

	scrawl.newWheel({ //jet sprite
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

	dWheel = scrawl.newWheel({ //display balls
		name: 'dWheel_0',
		pivot: 'pBall_0',
		group: 'colsGroup',
		radius: 10,
		collisionPoints: 'edges',
		method: 'fillDraw',
		fillStyle: getColor(scrawl.sprite.pBall_0.get('mass')),
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
			fillStyle: getColor(scrawl.sprite['pBall_' + i].get('mass')),
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
		hits = group.getFieldSpriteHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			myBall = scrawl.sprite[scrawl.sprite[hits[i][0]].pivot];
			myBall.revert();
			myBall.velocity.set({
				x: (scrawl.isBetween(hits[i][1].x, minX, maxX)) ? myBall.velocity.x : -myBall.velocity.x,
				y: (scrawl.isBetween(hits[i][1].y, minY, maxY)) ? myBall.velocity.y : -myBall.velocity.y,
			});
		}
	};

	//animation object
	scrawl.newAnimation({
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
