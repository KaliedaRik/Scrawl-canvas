var mycode = function() {
	'use strict';

	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var cellBox,
		entityBox,
		cellGrad,
		entityGrad,

		current_flip = 'normal',

		current_cellblock_startX = 150,
		current_cellblock_startY = 200,
		current_cellblock_handleX = 0,
		current_cellblock_handleY = 0,
		current_cellblock_width = 100,
		current_cellblock_height = 100,
		current_cellblock_roll = 0,
		current_cellblock_scale = 1,
		current_entityblock_startX = 450,
		current_entityblock_startY = 200,
		current_entityblock_handleX = 0,
		current_entityblock_handleY = 0,
		current_entityblock_width = 100,
		current_entityblock_height = 100,
		current_entityblock_roll = 0,
		current_entityblock_scale = 1,
		current_cellgrad_startX = 300,
		current_cellgrad_startY = 200,
		current_cellgrad_endX = 300,
		current_cellgrad_endY = 200,
		current_entitygrad_startX = 50,
		current_entitygrad_startY = 50,
		current_entitygrad_endX = 50,
		current_entitygrad_endY = 50,
		current_cellgrad_startRad = 0,
		current_cellgrad_endRad = 400,
		current_entitygrad_startRad = 0,
		current_entitygrad_endRad = 80,

		input_flip = document.getElementById('flip'),

		input_cellblock_startX_abs = document.getElementById('cellblock_startX_abs'),
		input_cellblock_startY_abs = document.getElementById('cellblock_startY_abs'),
		input_cellblock_handleX_abs = document.getElementById('cellblock_handleX_abs'),
		input_cellblock_handleY_abs = document.getElementById('cellblock_handleY_abs'),
		input_cellblock_width_abs = document.getElementById('cellblock_width_abs'),
		input_cellblock_height_abs = document.getElementById('cellblock_height_abs'),
		input_cellblock_roll = document.getElementById('cellblock_roll'),
		input_cellblock_scale = document.getElementById('cellblock_scale'),
		input_entityblock_startX_abs = document.getElementById('entityblock_startX_abs'),
		input_entityblock_startY_abs = document.getElementById('entityblock_startY_abs'),
		input_entityblock_handleX_abs = document.getElementById('entityblock_handleX_abs'),
		input_entityblock_handleY_abs = document.getElementById('entityblock_handleY_abs'),
		input_entityblock_width_abs = document.getElementById('entityblock_width_abs'),
		input_entityblock_height_abs = document.getElementById('entityblock_height_abs'),
		input_entityblock_roll = document.getElementById('entityblock_roll'),
		input_entityblock_scale = document.getElementById('entityblock_scale'),
		input_cellgrad_startX_abs = document.getElementById('cellgrad_startX_abs'),
		input_cellgrad_startY_abs = document.getElementById('cellgrad_startY_abs'),
		input_cellgrad_endX_abs = document.getElementById('cellgrad_endX_abs'),
		input_cellgrad_endY_abs = document.getElementById('cellgrad_endY_abs'),
		input_entitygrad_startX_abs = document.getElementById('entitygrad_startX_abs'),
		input_entitygrad_startY_abs = document.getElementById('entitygrad_startY_abs'),
		input_entitygrad_endX_abs = document.getElementById('entitygrad_endX_abs'),
		input_entitygrad_endY_abs = document.getElementById('entitygrad_endY_abs'),
		input_cellblock_startX_rel = document.getElementById('cellblock_startX_rel'),
		input_cellblock_startY_rel = document.getElementById('cellblock_startY_rel'),
		input_cellblock_handleX_rel = document.getElementById('cellblock_handleX_rel'),
		input_cellblock_handleY_rel = document.getElementById('cellblock_handleY_rel'),
		input_cellblock_width_rel = document.getElementById('cellblock_width_rel'),
		input_cellblock_height_rel = document.getElementById('cellblock_height_rel'),
		input_entityblock_startX_rel = document.getElementById('entityblock_startX_rel'),
		input_entityblock_startY_rel = document.getElementById('entityblock_startY_rel'),
		input_entityblock_handleX_rel = document.getElementById('entityblock_handleX_rel'),
		input_entityblock_handleY_rel = document.getElementById('entityblock_handleY_rel'),
		input_entityblock_width_rel = document.getElementById('entityblock_width_rel'),
		input_entityblock_height_rel = document.getElementById('entityblock_height_rel'),
		input_cellgrad_startX_rel = document.getElementById('cellgrad_startX_rel'),
		input_cellgrad_startY_rel = document.getElementById('cellgrad_startY_rel'),
		input_cellgrad_endX_rel = document.getElementById('cellgrad_endX_rel'),
		input_cellgrad_endY_rel = document.getElementById('cellgrad_endY_rel'),
		input_entitygrad_startX_rel = document.getElementById('entitygrad_startX_rel'),
		input_entitygrad_startY_rel = document.getElementById('entitygrad_startY_rel'),
		input_entitygrad_endX_rel = document.getElementById('entitygrad_endX_rel'),
		input_entitygrad_endY_rel = document.getElementById('entitygrad_endY_rel'),
		input_cellgrad_startRad = document.getElementById('cellgrad_startRad'),
		input_cellgrad_endRad = document.getElementById('cellgrad_endRad'),
		input_entitygrad_startRad = document.getElementById('entitygrad_startRad'),
		input_entitygrad_endRad = document.getElementById('entitygrad_endRad'),

		event_flip,

		event_cellblock_startX_abs,
		event_cellblock_startY_abs,
		event_cellblock_handleX_abs,
		event_cellblock_handleY_abs,
		event_cellblock_width_abs,
		event_cellblock_height_abs,
		event_cellblock_roll,
		event_cellblock_scale,
		event_entityblock_startX_abs,
		event_entityblock_startY_abs,
		event_entityblock_handleX_abs,
		event_entityblock_handleY_abs,
		event_entityblock_width_abs,
		event_entityblock_height_abs,
		event_entityblock_roll,
		event_entityblock_scale,
		event_cellgrad_startX_abs,
		event_cellgrad_startY_abs,
		event_cellgrad_endX_abs,
		event_cellgrad_endY_abs,
		event_entitygrad_startX_abs,
		event_entitygrad_startY_abs,
		event_entitygrad_endX_abs,
		event_entitygrad_endY_abs,
		event_cellblock_startX_rel,
		event_cellblock_startY_rel,
		event_cellblock_handleX_rel,
		event_cellblock_handleY_rel,
		event_cellblock_width_rel,
		event_cellblock_height_rel,
		event_entityblock_startX_rel,
		event_entityblock_startY_rel,
		event_entityblock_handleX_rel,
		event_entityblock_handleY_rel,
		event_entityblock_width_rel,
		event_entityblock_height_rel,
		event_cellgrad_startX_rel,
		event_cellgrad_startY_rel,
		event_cellgrad_endX_rel,
		event_cellgrad_endY_rel,
		event_entitygrad_startX_rel,
		event_entitygrad_startY_rel,
		event_entitygrad_endX_rel,
		event_entitygrad_endY_rel,
		event_cellgrad_startRad,
		event_cellgrad_endRad,
		event_entitygrad_startRad,
		event_entitygrad_endRad,

		stopE;

	//code here
	cellGrad = scrawl.newRadialGradient({
		name: 'g1',
		lockTo: false,
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
	entityGrad = scrawl.newRadialGradient({
		name: 'g2',
		lockTo: true,
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
	entityBox = scrawl.newBlock({
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
		text: 'Entity gradient',
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
	input_entityblock_startX_abs.value = 450;
	input_entityblock_startY_abs.value = 200;
	input_entityblock_handleX_abs.value = 0;
	input_entityblock_handleY_abs.value = 0;
	input_entityblock_width_abs.value = 100;
	input_entityblock_height_abs.value = 100;
	input_entityblock_roll.value = 0;
	input_entityblock_scale.value = 1;
	input_entityblock_startX_rel.value = 75;
	input_entityblock_startY_rel.value = 50;
	input_entityblock_handleX_rel.value = 0;
	input_entityblock_handleY_rel.value = 0;
	input_entityblock_width_rel.value = 20;
	input_entityblock_height_rel.value = 20;
	input_entitygrad_startX_abs.value = 50;
	input_entitygrad_startY_abs.value = 50;
	input_entitygrad_endX_abs.value = 50;
	input_entitygrad_endY_abs.value = 50;
	input_entitygrad_startX_rel.value = 50;
	input_entitygrad_startY_rel.value = 50;
	input_entitygrad_endX_rel.value = 50;
	input_entitygrad_endY_rel.value = 50;
	input_entitygrad_startRad.value = 0;
	input_entitygrad_endRad.value = 80;

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
				entityBox.set({
					flipReverse: true,
					flipUpend: false,
				});
				break;
			case 'upend':
				cellBox.set({
					flipReverse: false,
					flipUpend: true,
				});
				entityBox.set({
					flipReverse: false,
					flipUpend: true,
				});
				break;
			case 'both':
				cellBox.set({
					flipReverse: true,
					flipUpend: true,
				});
				entityBox.set({
					flipReverse: true,
					flipUpend: true,
				});
				break;
			default:
				cellBox.set({
					flipReverse: false,
					flipUpend: false,
				});
				entityBox.set({
					flipReverse: false,
					flipUpend: false,
				});
		}
	};
	input_flip.addEventListener('change', event_flip, false);

	event_entitygrad_startRad = function(e) {
		stopE(e);
		current_entitygrad_startRad = parseInt(input_entitygrad_startRad.value, 10);
		entityGrad.set({
			startRadius: current_entitygrad_startRad,
		});
	};
	input_entitygrad_startRad.addEventListener('input', event_entitygrad_startRad, false);
	input_entitygrad_startRad.addEventListener('change', event_entitygrad_startRad, false);

	event_entitygrad_endRad = function(e) {
		stopE(e);
		current_entitygrad_endRad = parseInt(input_entitygrad_endRad.value, 10);
		entityGrad.set({
			endRadius: current_entitygrad_endRad,
		});
	};
	input_entitygrad_endRad.addEventListener('input', event_entitygrad_endRad, false);
	input_entitygrad_endRad.addEventListener('change', event_entitygrad_endRad, false);

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

	event_entityblock_startX_abs = function(e) {
		stopE(e);
		current_entityblock_startX = parseInt(input_entityblock_startX_abs.value, 10);
		entityBox.set({
			startX: current_entityblock_startX,
		});
	};
	input_entityblock_startX_abs.addEventListener('input', event_entityblock_startX_abs, false);
	input_entityblock_startX_abs.addEventListener('change', event_entityblock_startX_abs, false);

	event_entityblock_startY_abs = function(e) {
		stopE(e);
		current_entityblock_startY = parseInt(input_entityblock_startY_abs.value, 10);
		entityBox.set({
			startY: current_entityblock_startY,
		});
	};
	input_entityblock_startY_abs.addEventListener('input', event_entityblock_startY_abs, false);
	input_entityblock_startY_abs.addEventListener('change', event_entityblock_startY_abs, false);

	event_entityblock_handleX_abs = function(e) {
		stopE(e);
		current_entityblock_handleX = parseInt(input_entityblock_handleX_abs.value, 10);
		entityBox.set({
			handleX: current_entityblock_handleX,
		});
	};
	input_entityblock_handleX_abs.addEventListener('input', event_entityblock_handleX_abs, false);
	input_entityblock_handleX_abs.addEventListener('change', event_entityblock_handleX_abs, false);

	event_entityblock_handleY_abs = function(e) {
		stopE(e);
		current_entityblock_handleY = parseInt(input_entityblock_handleY_abs.value, 10);
		entityBox.set({
			handleY: current_entityblock_handleY,
		});
	};
	input_entityblock_handleY_abs.addEventListener('input', event_entityblock_handleY_abs, false);
	input_entityblock_handleY_abs.addEventListener('change', event_entityblock_handleY_abs, false);

	event_entityblock_width_abs = function(e) {
		stopE(e);
		current_entityblock_width = parseInt(input_entityblock_width_abs.value, 10);
		entityBox.set({
			width: current_entityblock_width,
		});
	};
	input_entityblock_width_abs.addEventListener('input', event_entityblock_width_abs, false);
	input_entityblock_width_abs.addEventListener('change', event_entityblock_width_abs, false);

	event_entityblock_height_abs = function(e) {
		stopE(e);
		current_entityblock_height = parseInt(input_entityblock_height_abs.value, 10);
		entityBox.set({
			height: current_entityblock_height,
		});
	};
	input_entityblock_height_abs.addEventListener('input', event_entityblock_height_abs, false);
	input_entityblock_height_abs.addEventListener('change', event_entityblock_height_abs, false);

	event_entityblock_roll = function(e) {
		stopE(e);
		current_entityblock_roll = parseInt(input_entityblock_roll.value, 10);
		entityBox.set({
			roll: current_entityblock_roll,
		});
	};
	input_entityblock_roll.addEventListener('input', event_entityblock_roll, false);
	input_entityblock_roll.addEventListener('change', event_entityblock_roll, false);

	event_entityblock_scale = function(e) {
		stopE(e);
		current_entityblock_scale = parseFloat(input_entityblock_scale.value);
		entityBox.set({
			scale: current_entityblock_scale,
		});
	};
	input_entityblock_scale.addEventListener('input', event_entityblock_scale, false);
	input_entityblock_scale.addEventListener('change', event_entityblock_scale, false);

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

	event_entitygrad_startX_abs = function(e) {
		stopE(e);
		current_entitygrad_startX = parseInt(input_entitygrad_startX_abs.value, 10);
		entityGrad.set({
			startX: current_entitygrad_startX,
		});
	};
	input_entitygrad_startX_abs.addEventListener('input', event_entitygrad_startX_abs, false);
	input_entitygrad_startX_abs.addEventListener('change', event_entitygrad_startX_abs, false);

	event_entitygrad_startY_abs = function(e) {
		stopE(e);
		current_entitygrad_startY = parseInt(input_entitygrad_startY_abs.value, 10);
		entityGrad.set({
			startY: current_entitygrad_startY,
		});
	};
	input_entitygrad_startY_abs.addEventListener('input', event_entitygrad_startY_abs, false);
	input_entitygrad_startY_abs.addEventListener('change', event_entitygrad_startY_abs, false);

	event_entitygrad_endX_abs = function(e) {
		stopE(e);
		current_entitygrad_endX = parseInt(input_entitygrad_endX_abs.value, 10);
		entityGrad.set({
			endX: current_entitygrad_endX,
		});
	};
	input_entitygrad_endX_abs.addEventListener('input', event_entitygrad_endX_abs, false);
	input_entitygrad_endX_abs.addEventListener('change', event_entitygrad_endX_abs, false);

	event_entitygrad_endY_abs = function(e) {
		stopE(e);
		current_entitygrad_endY = parseInt(input_entitygrad_endY_abs.value, 10);
		entityGrad.set({
			endY: current_entitygrad_endY,
		});
	};
	input_entitygrad_endY_abs.addEventListener('input', event_entitygrad_endY_abs, false);
	input_entitygrad_endY_abs.addEventListener('change', event_entitygrad_endY_abs, false);

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

	event_entityblock_startX_rel = function(e) {
		stopE(e);
		current_entityblock_startX = input_entityblock_startX_rel.value + '%';
		entityBox.set({
			startX: current_entityblock_startX,
		});
	};
	input_entityblock_startX_rel.addEventListener('input', event_entityblock_startX_rel, false);
	input_entityblock_startX_rel.addEventListener('change', event_entityblock_startX_rel, false);

	event_entityblock_startY_rel = function(e) {
		stopE(e);
		current_entityblock_startY = input_entityblock_startY_rel.value + '%';
		entityBox.set({
			startY: current_entityblock_startY,
		});
	};
	input_entityblock_startY_rel.addEventListener('input', event_entityblock_startY_rel, false);
	input_entityblock_startY_rel.addEventListener('change', event_entityblock_startY_rel, false);

	event_entityblock_handleX_rel = function(e) {
		stopE(e);
		current_entityblock_handleX = input_entityblock_handleX_rel.value + '%';
		entityBox.set({
			handleX: current_entityblock_handleX,
		});
	};
	input_entityblock_handleX_rel.addEventListener('input', event_entityblock_handleX_rel, false);
	input_entityblock_handleX_rel.addEventListener('change', event_entityblock_handleX_rel, false);

	event_entityblock_handleY_rel = function(e) {
		stopE(e);
		current_entityblock_handleY = input_entityblock_handleY_rel.value + '%';
		entityBox.set({
			handleY: current_entityblock_handleY,
		});
	};
	input_entityblock_handleY_rel.addEventListener('input', event_entityblock_handleY_rel, false);
	input_entityblock_handleY_rel.addEventListener('change', event_entityblock_handleY_rel, false);

	event_entityblock_width_rel = function(e) {
		stopE(e);
		current_entityblock_width = input_entityblock_width_rel.value + '%';
		entityBox.set({
			width: current_entityblock_width,
		});
	};
	input_entityblock_width_rel.addEventListener('input', event_entityblock_width_rel, false);
	input_entityblock_width_rel.addEventListener('change', event_entityblock_width_rel, false);

	event_entityblock_height_rel = function(e) {
		stopE(e);
		current_entityblock_height = input_entityblock_height_rel.value + '%';
		entityBox.set({
			height: current_entityblock_height,
		});
	};
	input_entityblock_height_rel.addEventListener('input', event_entityblock_height_rel, false);
	input_entityblock_height_rel.addEventListener('change', event_entityblock_height_rel, false);

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

	event_entitygrad_startX_rel = function(e) {
		stopE(e);
		current_entitygrad_startX = input_entitygrad_startX_rel.value + '%';
		entityGrad.set({
			startX: current_entitygrad_startX,
		});
	};
	input_entitygrad_startX_rel.addEventListener('input', event_entitygrad_startX_rel, false);
	input_entitygrad_startX_rel.addEventListener('change', event_entitygrad_startX_rel, false);

	event_entitygrad_startY_rel = function(e) {
		stopE(e);
		current_entitygrad_startY = input_entitygrad_startY_rel.value + '%';
		entityGrad.set({
			startY: current_entitygrad_startY,
		});
	};
	input_entitygrad_startY_rel.addEventListener('input', event_entitygrad_startY_rel, false);
	input_entitygrad_startY_rel.addEventListener('change', event_entitygrad_startY_rel, false);

	event_entitygrad_endX_rel = function(e) {
		stopE(e);
		current_entitygrad_endX = input_entitygrad_endX_rel.value + '%';
		entityGrad.set({
			endX: current_entitygrad_endX,
		});
	};
	input_entitygrad_endX_rel.addEventListener('input', event_entitygrad_endX_rel, false);
	input_entitygrad_endX_rel.addEventListener('change', event_entitygrad_endX_rel, false);

	event_entitygrad_endY_rel = function(e) {
		stopE(e);
		current_entitygrad_endY = input_entitygrad_endY_rel.value + '%';
		entityGrad.set({
			endY: current_entitygrad_endY,
		});
	};
	input_entitygrad_endY_rel.addEventListener('input', event_entitygrad_endY_rel, false);
	input_entitygrad_endY_rel.addEventListener('change', event_entitygrad_endY_rel, false);


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
