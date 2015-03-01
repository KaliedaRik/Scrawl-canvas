var mycode = function() {
	'use strict';
	//hide-start
	var msg = document.getElementById('msg'),
		ticker = Date.now(),
		sTime = ticker,
		now;
	//hide-end

	//define variables
	var pad = scrawl.pad.mycanvas,
		message = document.getElementById('message'),
		tkr = Date.now(),
		dTime = 0,
		pBall,
		dBall,
		checkPositions;

	//add attributes to the physics object
	scrawl.physics.windSpeed = 15; //meters per second, blowing horizontally left-to-right

	//define physics objects
	pBall = scrawl.makeParticle({
		name: 'myball',
		startX: 300,
		startY: 20,
	});

	//add forces to the particle object
	pBall.addForce('gravity').addForce('drag');
	pBall.addForce(function(ball) {
		var c = 0.5 * scrawl.physics.airDensity * scrawl.physics.windSpeed * scrawl.physics.windSpeed,
			wind = scrawl.v.set({
				x: c * ball.get('area') * ball.get('drag'),
				y: 0,
				z: 0,
			});
		ball.load.vectorAdd(wind);
	});

	//define entitys
	dBall = scrawl.makeWheel({
		pivot: 'myball',
		radius: 10,
	});

	//iteration function
	checkPositions = function() {
		dTime = Date.now() - tkr;
		dTime = (dTime > 10) ? 10 : dTime;
		tkr = Date.now();

		//place check
		if (pBall.place.y > 620) {
			pBall.set({
				startX: 300,
				startY: 20,
				deltaX: 0, //reset velocity to zero
				deltaY: 0,
			});
		}

		//updating stuff
		scrawl.physics.deltaTime = dTime / 1000;
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			checkPositions();
			pad.render();

			message.innerHTML = 'Current speed: ' + Math.ceil(pBall.velocity.getMagnitude(), 10) + ' m/s';

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
	modules: ['physics', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
