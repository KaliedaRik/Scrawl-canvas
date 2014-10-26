var mycode = function() {
	'use strict';

	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var cellBox,
		spriteBox,
		cellGrad,
		spriteGrad,

		current_flip = 'normal',

		current_cellblock_startX = 150,
		current_cellblock_startY = 200,
		current_cellblock_handleX = 0,
		current_cellblock_handleY = 0,
		current_cellblock_width = 100,
		current_cellblock_height = 100,
		current_cellblock_roll = 0,
		current_cellblock_scale = 1,
		current_spriteblock_startX = 450,
		current_spriteblock_startY = 200,
		current_spriteblock_handleX = 0,
		current_spriteblock_handleY = 0,
		current_spriteblock_width = 100,
		current_spriteblock_height = 100,
		current_spriteblock_roll = 0,
		current_spriteblock_scale = 1,
		current_cellgrad_startX = 300,
		current_cellgrad_startY = 200,
		current_cellgrad_endX = 300,
		current_cellgrad_endY = 200,
		current_spritegrad_startX = 50,
		current_spritegrad_startY = 50,
		current_spritegrad_endX = 50,
		current_spritegrad_endY = 50,
		current_cellgrad_startRad = 0,
		current_cellgrad_endRad = 400,
		current_spritegrad_startRad = 0,
		current_spritegrad_endRad = 80,

		input_flip = document.getElementById('flip'),

		input_cellblock_startX_abs = document.getElementById('cellblock_startX_abs'),
		input_cellblock_startY_abs = document.getElementById('cellblock_startY_abs'),
		input_cellblock_handleX_abs = document.getElementById('cellblock_handleX_abs'),
		input_cellblock_handleY_abs = document.getElementById('cellblock_handleY_abs'),
		input_cellblock_width_abs = document.getElementById('cellblock_width_abs'),
		input_cellblock_height_abs = document.getElementById('cellblock_height_abs'),
		input_cellblock_roll = document.getElementById('cellblock_roll'),
		input_cellblock_scale = document.getElementById('cellblock_scale'),
		input_spriteblock_startX_abs = document.getElementById('spriteblock_startX_abs'),
		input_spriteblock_startY_abs = document.getElementById('spriteblock_startY_abs'),
		input_spriteblock_handleX_abs = document.getElementById('spriteblock_handleX_abs'),
		input_spriteblock_handleY_abs = document.getElementById('spriteblock_handleY_abs'),
		input_spriteblock_width_abs = document.getElementById('spriteblock_width_abs'),
		input_spriteblock_height_abs = document.getElementById('spriteblock_height_abs'),
		input_spriteblock_roll = document.getElementById('spriteblock_roll'),
		input_spriteblock_scale = document.getElementById('spriteblock_scale'),
		input_cellgrad_startX_abs = document.getElementById('cellgrad_startX_abs'),
		input_cellgrad_startY_abs = document.getElementById('cellgrad_startY_abs'),
		input_cellgrad_endX_abs = document.getElementById('cellgrad_endX_abs'),
		input_cellgrad_endY_abs = document.getElementById('cellgrad_endY_abs'),
		input_spritegrad_startX_abs = document.getElementById('spritegrad_startX_abs'),
		input_spritegrad_startY_abs = document.getElementById('spritegrad_startY_abs'),
		input_spritegrad_endX_abs = document.getElementById('spritegrad_endX_abs'),
		input_spritegrad_endY_abs = document.getElementById('spritegrad_endY_abs'),
		input_cellblock_startX_rel = document.getElementById('cellblock_startX_rel'),
		input_cellblock_startY_rel = document.getElementById('cellblock_startY_rel'),
		input_cellblock_handleX_rel = document.getElementById('cellblock_handleX_rel'),
		input_cellblock_handleY_rel = document.getElementById('cellblock_handleY_rel'),
		input_cellblock_width_rel = document.getElementById('cellblock_width_rel'),
		input_cellblock_height_rel = document.getElementById('cellblock_height_rel'),
		input_spriteblock_startX_rel = document.getElementById('spriteblock_startX_rel'),
		input_spriteblock_startY_rel = document.getElementById('spriteblock_startY_rel'),
		input_spriteblock_handleX_rel = document.getElementById('spriteblock_handleX_rel'),
		input_spriteblock_handleY_rel = document.getElementById('spriteblock_handleY_rel'),
		input_spriteblock_width_rel = document.getElementById('spriteblock_width_rel'),
		input_spriteblock_height_rel = document.getElementById('spriteblock_height_rel'),
		input_cellgrad_startX_rel = document.getElementById('cellgrad_startX_rel'),
		input_cellgrad_startY_rel = document.getElementById('cellgrad_startY_rel'),
		input_cellgrad_endX_rel = document.getElementById('cellgrad_endX_rel'),
		input_cellgrad_endY_rel = document.getElementById('cellgrad_endY_rel'),
		input_spritegrad_startX_rel = document.getElementById('spritegrad_startX_rel'),
		input_spritegrad_startY_rel = document.getElementById('spritegrad_startY_rel'),
		input_spritegrad_endX_rel = document.getElementById('spritegrad_endX_rel'),
		input_spritegrad_endY_rel = document.getElementById('spritegrad_endY_rel'),
		input_cellgrad_startRad = document.getElementById('cellgrad_startRad'),
		input_cellgrad_endRad = document.getElementById('cellgrad_endRad'),
		input_spritegrad_startRad = document.getElementById('spritegrad_startRad'),
		input_spritegrad_endRad = document.getElementById('spritegrad_endRad'),

		event_flip,

		event_cellblock_startX_abs,
		event_cellblock_startY_abs,
		event_cellblock_handleX_abs,
		event_cellblock_handleY_abs,
		event_cellblock_width_abs,
		event_cellblock_height_abs,
		event_cellblock_roll,
		event_cellblock_scale,
		event_spriteblock_startX_abs,
		event_spriteblock_startY_abs,
		event_spriteblock_handleX_abs,
		event_spriteblock_handleY_abs,
		event_spriteblock_width_abs,
		event_spriteblock_height_abs,
		event_spriteblock_roll,
		event_spriteblock_scale,
		event_cellgrad_startX_abs,
		event_cellgrad_startY_abs,
		event_cellgrad_endX_abs,
		event_cellgrad_endY_abs,
		event_spritegrad_startX_abs,
		event_spritegrad_startY_abs,
		event_spritegrad_endX_abs,
		event_spritegrad_endY_abs,
		event_cellblock_startX_rel,
		event_cellblock_startY_rel,
		event_cellblock_handleX_rel,
		event_cellblock_handleY_rel,
		event_cellblock_width_rel,
		event_cellblock_height_rel,
		event_spriteblock_startX_rel,
		event_spriteblock_startY_rel,
		event_spriteblock_handleX_rel,
		event_spriteblock_handleY_rel,
		event_spriteblock_width_rel,
		event_spriteblock_height_rel,
		event_cellgrad_startX_rel,
		event_cellgrad_startY_rel,
		event_cellgrad_endX_rel,
		event_cellgrad_endY_rel,
		event_spritegrad_startX_rel,
		event_spritegrad_startY_rel,
		event_spritegrad_endX_rel,
		event_spritegrad_endY_rel,
		event_cellgrad_startRad,
		event_cellgrad_endRad,
		event_spritegrad_startRad,
		event_spritegrad_endRad,

		stopE;

	//code here
	cellGrad = scrawl.newRadialGradient({
		name: 'g1',
		setToSprite: false,
		startX: 400,
		startY: 300,
		startRadius: 0,
		endX: 400,
		endY: 300,
		endRadius: 800,
		color: [{
			color: 'red',
			stop: 0
        }, {
			color: 'purple',
			stop: 0.48
        }, {
			color: 'white',
			stop: 0.5
        }, {
			color: 'purple',
			stop: 0.52
        }, {
			color: 'blue',
			stop: 1
        }, ],
	});
	spriteGrad = scrawl.newRadialGradient({
		name: 'g2',
		setToSprite: true,
		startX: 100,
		startY: 100,
		startRadius: 0,
		endX: 100,
		endY: 100,
		endRadius: 80,
		color: [{
			color: 'green',
			stop: 0
        }, {
			color: 'lightgreen',
			stop: 0.48
        }, {
			color: 'white',
			stop: 0.5
        }, {
			color: 'lightgreen',
			stop: 0.52
        }, {
			color: 'yellow',
			stop: 1
        }, ],
	});

	cellBox = scrawl.newBlock({
		name: 'box1',
		startX: 150,
		startY: 200,
		width: 100,
		height: 100,
		handleX: 0,
		handleY: 0,
		roll: 0,
		method: 'fillDraw',
		lineWidth: 2,
		fillStyle: 'g1',
	});
	spriteBox = scrawl.newBlock({
		name: 'box2',
		startX: 450,
		startY: 200,
		width: 100,
		height: 100,
		roll: 0,
		method: 'fillDraw',
		lineWidth: 2,
		fillStyle: 'g2',
	});
	scrawl.newPhrase({
		pivot: 'box1',
		text: 'Cell gradient',
		handleX: -20,
		handleY: -20,
	}).clone({
		pivot: 'box2',
		text: 'Sprite gradient',
	});

	input_flip.value = 'normal';

	input_cellblock_startX_abs.value = 150;
	input_cellblock_startY_abs.value = 200;
	input_cellblock_handleX_abs.value = 0;
	input_cellblock_handleY_abs.value = 0;
	input_cellblock_width_abs.value = 100;
	input_cellblock_height_abs.value = 100;
	input_cellblock_roll.value = 0;
	input_cellblock_scale.value = 1;
	input_cellblock_startX_rel.value = 25;
	input_cellblock_startY_rel.value = 50;
	input_cellblock_handleX_rel.value = 0;
	input_cellblock_handleY_rel.value = 0;
	input_cellblock_width_rel.value = 20;
	input_cellblock_height_rel.value = 20;
	input_cellgrad_startX_abs.value = 300;
	input_cellgrad_startY_abs.value = 200;
	input_cellgrad_endX_abs.value = 300;
	input_cellgrad_endY_abs.value = 200;
	input_cellgrad_startX_rel.value = 50;
	input_cellgrad_startY_rel.value = 50;
	input_cellgrad_endX_rel.value = 50;
	input_cellgrad_endY_rel.value = 50;
	input_cellgrad_startRad.value = 0;
	input_cellgrad_endRad.value = 400;
	input_spriteblock_startX_abs.value = 450;
	input_spriteblock_startY_abs.value = 200;
	input_spriteblock_handleX_abs.value = 0;
	input_spriteblock_handleY_abs.value = 0;
	input_spriteblock_width_abs.value = 100;
	input_spriteblock_height_abs.value = 100;
	input_spriteblock_roll.value = 0;
	input_spriteblock_scale.value = 1;
	input_spriteblock_startX_rel.value = 75;
	input_spriteblock_startY_rel.value = 50;
	input_spriteblock_handleX_rel.value = 0;
	input_spriteblock_handleY_rel.value = 0;
	input_spriteblock_width_rel.value = 20;
	input_spriteblock_height_rel.value = 20;
	input_spritegrad_startX_abs.value = 50;
	input_spritegrad_startY_abs.value = 50;
	input_spritegrad_endX_abs.value = 50;
	input_spritegrad_endY_abs.value = 50;
	input_spritegrad_startX_rel.value = 50;
	input_spritegrad_startY_rel.value = 50;
	input_spritegrad_endX_rel.value = 50;
	input_spritegrad_endY_rel.value = 50;
	input_spritegrad_startRad.value = 0;
	input_spritegrad_endRad.value = 80;

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_flip = function(e) {
		stopE(e);
		current_flip = input_flip.value;
		switch (current_flip) {
			case 'reverse':
				cellBox.set({
					flipReverse: true,
					flipUpend: false,
				});
				spriteBox.set({
					flipReverse: true,
					flipUpend: false,
				});
				break;
			case 'upend':
				cellBox.set({
					flipReverse: false,
					flipUpend: true,
				});
				spriteBox.set({
					flipReverse: false,
					flipUpend: true,
				});
				break;
			case 'both':
				cellBox.set({
					flipReverse: true,
					flipUpend: true,
				});
				spriteBox.set({
					flipReverse: true,
					flipUpend: true,
				});
				break;
			default:
				cellBox.set({
					flipReverse: false,
					flipUpend: false,
				});
				spriteBox.set({
					flipReverse: false,
					flipUpend: false,
				});
		}
	};
	input_flip.addEventListener('change', event_flip, false);

	event_spritegrad_startRad = function(e) {
		stopE(e);
		current_spritegrad_startRad = parseInt(input_spritegrad_startRad.value, 10);
		spriteGrad.set({
			startRadius: current_spritegrad_startRad,
		});
	};
	input_spritegrad_startRad.addEventListener('input', event_spritegrad_startRad, false);
	input_spritegrad_startRad.addEventListener('change', event_spritegrad_startRad, false);

	event_spritegrad_endRad = function(e) {
		stopE(e);
		current_spritegrad_endRad = parseInt(input_spritegrad_endRad.value, 10);
		spriteGrad.set({
			endRadius: current_spritegrad_endRad,
		});
	};
	input_spritegrad_endRad.addEventListener('input', event_spritegrad_endRad, false);
	input_spritegrad_endRad.addEventListener('change', event_spritegrad_endRad, false);

	event_cellgrad_startRad = function(e) {
		stopE(e);
		current_cellgrad_startRad = parseInt(input_cellgrad_startRad.value, 10);
		cellGrad.set({
			startRadius: current_cellgrad_startRad,
		});
	};
	input_cellgrad_startRad.addEventListener('input', event_cellgrad_startRad, false);
	input_cellgrad_startRad.addEventListener('change', event_cellgrad_startRad, false);

	event_cellgrad_endRad = function(e) {
		stopE(e);
		current_cellgrad_endRad = parseInt(input_cellgrad_endRad.value, 10);
		cellGrad.set({
			endRadius: current_cellgrad_endRad,
		});
	};
	input_cellgrad_endRad.addEventListener('input', event_cellgrad_endRad, false);
	input_cellgrad_endRad.addEventListener('change', event_cellgrad_endRad, false);

	event_cellblock_startX_abs = function(e) {
		stopE(e);
		current_cellblock_startX = parseInt(input_cellblock_startX_abs.value, 10);
		cellBox.set({
			startX: current_cellblock_startX,
		});
	};
	input_cellblock_startX_abs.addEventListener('input', event_cellblock_startX_abs, false);
	input_cellblock_startX_abs.addEventListener('change', event_cellblock_startX_abs, false);

	event_cellblock_startY_abs = function(e) {
		stopE(e);
		current_cellblock_startY = parseInt(input_cellblock_startY_abs.value, 10);
		cellBox.set({
			startY: current_cellblock_startY,
		});
	};
	input_cellblock_startY_abs.addEventListener('input', event_cellblock_startY_abs, false);
	input_cellblock_startY_abs.addEventListener('change', event_cellblock_startY_abs, false);

	event_cellblock_handleX_abs = function(e) {
		stopE(e);
		current_cellblock_handleX = parseInt(input_cellblock_handleX_abs.value, 10);
		cellBox.set({
			handleX: current_cellblock_handleX,
		});
	};
	input_cellblock_handleX_abs.addEventListener('input', event_cellblock_handleX_abs, false);
	input_cellblock_handleX_abs.addEventListener('change', event_cellblock_handleX_abs, false);

	event_cellblock_handleY_abs = function(e) {
		stopE(e);
		current_cellblock_handleY = parseInt(input_cellblock_handleY_abs.value, 10);
		cellBox.set({
			handleY: current_cellblock_handleY,
		});
	};
	input_cellblock_handleY_abs.addEventListener('input', event_cellblock_handleY_abs, false);
	input_cellblock_handleY_abs.addEventListener('change', event_cellblock_handleY_abs, false);

	event_cellblock_width_abs = function(e) {
		stopE(e);
		current_cellblock_width = parseInt(input_cellblock_width_abs.value, 10);
		cellBox.set({
			width: current_cellblock_width,
		});
	};
	input_cellblock_width_abs.addEventListener('input', event_cellblock_width_abs, false);
	input_cellblock_width_abs.addEventListener('change', event_cellblock_width_abs, false);

	event_cellblock_height_abs = function(e) {
		stopE(e);
		current_cellblock_height = parseInt(input_cellblock_height_abs.value, 10);
		cellBox.set({
			height: current_cellblock_height,
		});
	};
	input_cellblock_height_abs.addEventListener('input', event_cellblock_height_abs, false);
	input_cellblock_height_abs.addEventListener('change', event_cellblock_height_abs, false);

	event_cellblock_roll = function(e) {
		stopE(e);
		current_cellblock_roll = parseInt(input_cellblock_roll.value, 10);
		cellBox.set({
			roll: current_cellblock_roll,
		});
	};
	input_cellblock_roll.addEventListener('input', event_cellblock_roll, false);
	input_cellblock_roll.addEventListener('change', event_cellblock_roll, false);

	event_cellblock_scale = function(e) {
		stopE(e);
		current_cellblock_scale = parseFloat(input_cellblock_scale.value);
		cellBox.set({
			scale: current_cellblock_scale,
		});
	};
	input_cellblock_scale.addEventListener('input', event_cellblock_scale, false);
	input_cellblock_scale.addEventListener('change', event_cellblock_scale, false);

	event_spriteblock_startX_abs = function(e) {
		stopE(e);
		current_spriteblock_startX = parseInt(input_spriteblock_startX_abs.value, 10);
		spriteBox.set({
			startX: current_spriteblock_startX,
		});
	};
	input_spriteblock_startX_abs.addEventListener('input', event_spriteblock_startX_abs, false);
	input_spriteblock_startX_abs.addEventListener('change', event_spriteblock_startX_abs, false);

	event_spriteblock_startY_abs = function(e) {
		stopE(e);
		current_spriteblock_startY = parseInt(input_spriteblock_startY_abs.value, 10);
		spriteBox.set({
			startY: current_spriteblock_startY,
		});
	};
	input_spriteblock_startY_abs.addEventListener('input', event_spriteblock_startY_abs, false);
	input_spriteblock_startY_abs.addEventListener('change', event_spriteblock_startY_abs, false);

	event_spriteblock_handleX_abs = function(e) {
		stopE(e);
		current_spriteblock_handleX = parseInt(input_spriteblock_handleX_abs.value, 10);
		spriteBox.set({
			handleX: current_spriteblock_handleX,
		});
	};
	input_spriteblock_handleX_abs.addEventListener('input', event_spriteblock_handleX_abs, false);
	input_spriteblock_handleX_abs.addEventListener('change', event_spriteblock_handleX_abs, false);

	event_spriteblock_handleY_abs = function(e) {
		stopE(e);
		current_spriteblock_handleY = parseInt(input_spriteblock_handleY_abs.value, 10);
		spriteBox.set({
			handleY: current_spriteblock_handleY,
		});
	};
	input_spriteblock_handleY_abs.addEventListener('input', event_spriteblock_handleY_abs, false);
	input_spriteblock_handleY_abs.addEventListener('change', event_spriteblock_handleY_abs, false);

	event_spriteblock_width_abs = function(e) {
		stopE(e);
		current_spriteblock_width = parseInt(input_spriteblock_width_abs.value, 10);
		spriteBox.set({
			width: current_spriteblock_width,
		});
	};
	input_spriteblock_width_abs.addEventListener('input', event_spriteblock_width_abs, false);
	input_spriteblock_width_abs.addEventListener('change', event_spriteblock_width_abs, false);

	event_spriteblock_height_abs = function(e) {
		stopE(e);
		current_spriteblock_height = parseInt(input_spriteblock_height_abs.value, 10);
		spriteBox.set({
			height: current_spriteblock_height,
		});
	};
	input_spriteblock_height_abs.addEventListener('input', event_spriteblock_height_abs, false);
	input_spriteblock_height_abs.addEventListener('change', event_spriteblock_height_abs, false);

	event_spriteblock_roll = function(e) {
		stopE(e);
		current_spriteblock_roll = parseInt(input_spriteblock_roll.value, 10);
		spriteBox.set({
			roll: current_spriteblock_roll,
		});
	};
	input_spriteblock_roll.addEventListener('input', event_spriteblock_roll, false);
	input_spriteblock_roll.addEventListener('change', event_spriteblock_roll, false);

	event_spriteblock_scale = function(e) {
		stopE(e);
		current_spriteblock_scale = parseFloat(input_spriteblock_scale.value);
		spriteBox.set({
			scale: current_spriteblock_scale,
		});
	};
	input_spriteblock_scale.addEventListener('input', event_spriteblock_scale, false);
	input_spriteblock_scale.addEventListener('change', event_spriteblock_scale, false);

	event_cellgrad_startX_abs = function(e) {
		stopE(e);
		current_cellgrad_startX = parseInt(input_cellgrad_startX_abs.value, 10);
		cellGrad.set({
			startX: current_cellgrad_startX,
		});
	};
	input_cellgrad_startX_abs.addEventListener('input', event_cellgrad_startX_abs, false);
	input_cellgrad_startX_abs.addEventListener('change', event_cellgrad_startX_abs, false);

	event_cellgrad_startY_abs = function(e) {
		stopE(e);
		current_cellgrad_startY = parseInt(input_cellgrad_startY_abs.value, 10);
		cellGrad.set({
			startY: current_cellgrad_startY,
		});
	};
	input_cellgrad_startY_abs.addEventListener('input', event_cellgrad_startY_abs, false);
	input_cellgrad_startY_abs.addEventListener('change', event_cellgrad_startY_abs, false);

	event_cellgrad_endX_abs = function(e) {
		stopE(e);
		current_cellgrad_endX = parseInt(input_cellgrad_endX_abs.value, 10);
		cellGrad.set({
			endX: current_cellgrad_endX,
		});
	};
	input_cellgrad_endX_abs.addEventListener('input', event_cellgrad_endX_abs, false);
	input_cellgrad_endX_abs.addEventListener('change', event_cellgrad_endX_abs, false);

	event_cellgrad_endY_abs = function(e) {
		stopE(e);
		current_cellgrad_endY = parseInt(input_cellgrad_endY_abs.value, 10);
		cellGrad.set({
			endY: current_cellgrad_endY,
		});
	};
	input_cellgrad_endY_abs.addEventListener('input', event_cellgrad_endY_abs, false);
	input_cellgrad_endY_abs.addEventListener('change', event_cellgrad_endY_abs, false);

	event_spritegrad_startX_abs = function(e) {
		stopE(e);
		current_spritegrad_startX = parseInt(input_spritegrad_startX_abs.value, 10);
		spriteGrad.set({
			startX: current_spritegrad_startX,
		});
	};
	input_spritegrad_startX_abs.addEventListener('input', event_spritegrad_startX_abs, false);
	input_spritegrad_startX_abs.addEventListener('change', event_spritegrad_startX_abs, false);

	event_spritegrad_startY_abs = function(e) {
		stopE(e);
		current_spritegrad_startY = parseInt(input_spritegrad_startY_abs.value, 10);
		spriteGrad.set({
			startY: current_spritegrad_startY,
		});
	};
	input_spritegrad_startY_abs.addEventListener('input', event_spritegrad_startY_abs, false);
	input_spritegrad_startY_abs.addEventListener('change', event_spritegrad_startY_abs, false);

	event_spritegrad_endX_abs = function(e) {
		stopE(e);
		current_spritegrad_endX = parseInt(input_spritegrad_endX_abs.value, 10);
		spriteGrad.set({
			endX: current_spritegrad_endX,
		});
	};
	input_spritegrad_endX_abs.addEventListener('input', event_spritegrad_endX_abs, false);
	input_spritegrad_endX_abs.addEventListener('change', event_spritegrad_endX_abs, false);

	event_spritegrad_endY_abs = function(e) {
		stopE(e);
		current_spritegrad_endY = parseInt(input_spritegrad_endY_abs.value, 10);
		spriteGrad.set({
			endY: current_spritegrad_endY,
		});
	};
	input_spritegrad_endY_abs.addEventListener('input', event_spritegrad_endY_abs, false);
	input_spritegrad_endY_abs.addEventListener('change', event_spritegrad_endY_abs, false);

	event_cellblock_startX_rel = function(e) {
		stopE(e);
		current_cellblock_startX = input_cellblock_startX_rel.value + '%';
		cellBox.set({
			startX: current_cellblock_startX,
		});
	};
	input_cellblock_startX_rel.addEventListener('input', event_cellblock_startX_rel, false);
	input_cellblock_startX_rel.addEventListener('change', event_cellblock_startX_rel, false);

	event_cellblock_startY_rel = function(e) {
		stopE(e);
		current_cellblock_startY = input_cellblock_startY_rel.value + '%';
		cellBox.set({
			startY: current_cellblock_startY,
		});
	};
	input_cellblock_startY_rel.addEventListener('input', event_cellblock_startY_rel, false);
	input_cellblock_startY_rel.addEventListener('change', event_cellblock_startY_rel, false);

	event_cellblock_handleX_rel = function(e) {
		stopE(e);
		current_cellblock_handleX = input_cellblock_handleX_rel.value + '%';
		cellBox.set({
			handleX: current_cellblock_handleX,
		});
	};
	input_cellblock_handleX_rel.addEventListener('input', event_cellblock_handleX_rel, false);
	input_cellblock_handleX_rel.addEventListener('change', event_cellblock_handleX_rel, false);

	event_cellblock_handleY_rel = function(e) {
		stopE(e);
		current_cellblock_handleY = input_cellblock_handleY_rel.value + '%';
		cellBox.set({
			handleY: current_cellblock_handleY,
		});
	};
	input_cellblock_handleY_rel.addEventListener('input', event_cellblock_handleY_rel, false);
	input_cellblock_handleY_rel.addEventListener('change', event_cellblock_handleY_rel, false);

	event_cellblock_width_rel = function(e) {
		stopE(e);
		current_cellblock_width = input_cellblock_width_rel.value + '%';
		cellBox.set({
			width: current_cellblock_width,
		});
	};
	input_cellblock_width_rel.addEventListener('input', event_cellblock_width_rel, false);
	input_cellblock_width_rel.addEventListener('change', event_cellblock_width_rel, false);

	event_cellblock_height_rel = function(e) {
		stopE(e);
		current_cellblock_height = input_cellblock_height_rel.value + '%';
		cellBox.set({
			height: current_cellblock_height,
		});
	};
	input_cellblock_height_rel.addEventListener('input', event_cellblock_height_rel, false);
	input_cellblock_height_rel.addEventListener('change', event_cellblock_height_rel, false);

	event_spriteblock_startX_rel = function(e) {
		stopE(e);
		current_spriteblock_startX = input_spriteblock_startX_rel.value + '%';
		spriteBox.set({
			startX: current_spriteblock_startX,
		});
	};
	input_spriteblock_startX_rel.addEventListener('input', event_spriteblock_startX_rel, false);
	input_spriteblock_startX_rel.addEventListener('change', event_spriteblock_startX_rel, false);

	event_spriteblock_startY_rel = function(e) {
		stopE(e);
		current_spriteblock_startY = input_spriteblock_startY_rel.value + '%';
		spriteBox.set({
			startY: current_spriteblock_startY,
		});
	};
	input_spriteblock_startY_rel.addEventListener('input', event_spriteblock_startY_rel, false);
	input_spriteblock_startY_rel.addEventListener('change', event_spriteblock_startY_rel, false);

	event_spriteblock_handleX_rel = function(e) {
		stopE(e);
		current_spriteblock_handleX = input_spriteblock_handleX_rel.value + '%';
		spriteBox.set({
			handleX: current_spriteblock_handleX,
		});
	};
	input_spriteblock_handleX_rel.addEventListener('input', event_spriteblock_handleX_rel, false);
	input_spriteblock_handleX_rel.addEventListener('change', event_spriteblock_handleX_rel, false);

	event_spriteblock_handleY_rel = function(e) {
		stopE(e);
		current_spriteblock_handleY = input_spriteblock_handleY_rel.value + '%';
		spriteBox.set({
			handleY: current_spriteblock_handleY,
		});
	};
	input_spriteblock_handleY_rel.addEventListener('input', event_spriteblock_handleY_rel, false);
	input_spriteblock_handleY_rel.addEventListener('change', event_spriteblock_handleY_rel, false);

	event_spriteblock_width_rel = function(e) {
		stopE(e);
		current_spriteblock_width = input_spriteblock_width_rel.value + '%';
		spriteBox.set({
			width: current_spriteblock_width,
		});
	};
	input_spriteblock_width_rel.addEventListener('input', event_spriteblock_width_rel, false);
	input_spriteblock_width_rel.addEventListener('change', event_spriteblock_width_rel, false);

	event_spriteblock_height_rel = function(e) {
		stopE(e);
		current_spriteblock_height = input_spriteblock_height_rel.value + '%';
		spriteBox.set({
			height: current_spriteblock_height,
		});
	};
	input_spriteblock_height_rel.addEventListener('input', event_spriteblock_height_rel, false);
	input_spriteblock_height_rel.addEventListener('change', event_spriteblock_height_rel, false);

	event_cellgrad_startX_rel = function(e) {
		stopE(e);
		current_cellgrad_startX = input_cellgrad_startX_rel.value + '%';
		cellGrad.set({
			startX: current_cellgrad_startX,
		});
	};
	input_cellgrad_startX_rel.addEventListener('input', event_cellgrad_startX_rel, false);
	input_cellgrad_startX_rel.addEventListener('change', event_cellgrad_startX_rel, false);

	event_cellgrad_startY_rel = function(e) {
		stopE(e);
		current_cellgrad_startY = input_cellgrad_startY_rel.value + '%';
		cellGrad.set({
			startY: current_cellgrad_startY,
		});
	};
	input_cellgrad_startY_rel.addEventListener('input', event_cellgrad_startY_rel, false);
	input_cellgrad_startY_rel.addEventListener('change', event_cellgrad_startY_rel, false);

	event_cellgrad_endX_rel = function(e) {
		stopE(e);
		current_cellgrad_endX = input_cellgrad_endX_rel.value + '%';
		cellGrad.set({
			endX: current_cellgrad_endX,
		});
	};
	input_cellgrad_endX_rel.addEventListener('input', event_cellgrad_endX_rel, false);
	input_cellgrad_endX_rel.addEventListener('change', event_cellgrad_endX_rel, false);

	event_cellgrad_endY_rel = function(e) {
		stopE(e);
		current_cellgrad_endY = input_cellgrad_endY_rel.value + '%';
		cellGrad.set({
			endY: current_cellgrad_endY,
		});
	};
	input_cellgrad_endY_rel.addEventListener('input', event_cellgrad_endY_rel, false);
	input_cellgrad_endY_rel.addEventListener('change', event_cellgrad_endY_rel, false);

	event_spritegrad_startX_rel = function(e) {
		stopE(e);
		current_spritegrad_startX = input_spritegrad_startX_rel.value + '%';
		spriteGrad.set({
			startX: current_spritegrad_startX,
		});
	};
	input_spritegrad_startX_rel.addEventListener('input', event_spritegrad_startX_rel, false);
	input_spritegrad_startX_rel.addEventListener('change', event_spritegrad_startX_rel, false);

	event_spritegrad_startY_rel = function(e) {
		stopE(e);
		current_spritegrad_startY = input_spritegrad_startY_rel.value + '%';
		spriteGrad.set({
			startY: current_spritegrad_startY,
		});
	};
	input_spritegrad_startY_rel.addEventListener('input', event_spritegrad_startY_rel, false);
	input_spritegrad_startY_rel.addEventListener('change', event_spritegrad_startY_rel, false);

	event_spritegrad_endX_rel = function(e) {
		stopE(e);
		current_spritegrad_endX = input_spritegrad_endX_rel.value + '%';
		spriteGrad.set({
			endX: current_spritegrad_endX,
		});
	};
	input_spritegrad_endX_rel.addEventListener('input', event_spritegrad_endX_rel, false);
	input_spritegrad_endX_rel.addEventListener('change', event_spritegrad_endX_rel, false);

	event_spritegrad_endY_rel = function(e) {
		stopE(e);
		current_spritegrad_endY = input_spritegrad_endY_rel.value + '%';
		spriteGrad.set({
			endY: current_spritegrad_endY,
		});
	};
	input_spritegrad_endY_rel.addEventListener('input', event_spritegrad_endY_rel, false);
	input_spritegrad_endY_rel.addEventListener('change', event_spritegrad_endY_rel, false);


	//animation object
	scrawl.newAnimation({
		fn: function() {

			//code here
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});

};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
