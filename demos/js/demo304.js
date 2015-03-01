var mycode = function() {
	'use strict';

	//define variables
	var pad = scrawl.pad.mycanvas,
		ticker = Date.now(),
		dTime = 0,
		sTime = 0,
		timeSpeed = 25,
		rope,
		calculatePositions,
		msg1 = document.getElementById('msg1'),
		msg2 = document.getElementById('msg2'),
		msg3 = document.getElementById('msg3'),
		i;

	//define entitys
	rope = scrawl.makePath({
		name: 'rope',
		lineWidth: 10,
		lineJoin: 'round',
		lineCap: 'round',
		data: 'm0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0',
		markStart: 'pin',
		mark: 'joint',
		precision: 1,
	});

	scrawl.makeWheel({
		name: 'joint',
		radius: 3,
		fillStyle: 'gold',
		visibility: 'false',
	});

	scrawl.makeWheel({
		name: 'pin',
		method: 'fillDraw',
		radius: 10,
		fillStyle: 'red',
		lineWidth: 2,
		visibility: 'false',
	});

	//define physics objects
	for (i = 0; i < 20; i++) { //define particles for animating rope
		scrawl.makeParticle({
			name: 'b_' + i,
			startX: 300 + (i * 15),
			startY: 100,
			mass: 50,
			radius: 0.1,
		}).addForce('gravity');
		scrawl.point['rope_p' + (i + 1)].fixed = 'b_' + i; //assign rope points to particle objects
	}
	scrawl.entity.b_0.set({ //fix top of rope to display
		mobile: false,
	});

	for (i = 0; i < 19; i++) { //add in springs between particles
		scrawl.entity['b_' + i].addSpring({
			end: 'b_' + (i + 1),
			springConstant: 8000,
		});
	}

	//physics update function
	calculatePositions = function() {
		//update time
		var now = Date.now();
		sTime = now - ticker;
		ticker = now;
		dTime = (sTime > timeSpeed) ? timeSpeed : sTime;
		scrawl.physics.deltaTime = dTime / 1000;
		//calculate springs
		scrawl.updateSprings();
		//calculate particle positions and display results
		pad.render();
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			calculatePositions();

			msg1.innerHTML = 'Milliseconds per physics refresh: ' + Math.ceil(dTime);
			msg2.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(sTime);
			msg3.innerHTML = 'Frames per second: ' + Math.floor(1000 / sTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['animation', 'path', 'wheel', 'physics'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
