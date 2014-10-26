var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myCell = scrawl.cell[myPad.base],

		current_targetX = 0,
		current_targetY = 0,
		current_targetWidth = 580,
		current_targetHeight = 400,
		current_handleX = 0,
		current_handleY = 0,
		current_sourceX = 0,
		current_sourceY = 0,
		current_sourceWidth = 580,
		current_sourceHeight = 400,
		current_scale = 1,
		current_roll = 0,
		current_flip = 'normal',

		input_targetX_abs = document.getElementById('targetX_abs'),
		input_targetY_abs = document.getElementById('targetY_abs'),
		input_targetX_rel = document.getElementById('targetX_rel'),
		input_targetY_rel = document.getElementById('targetY_rel'),
		input_targetWidth_abs = document.getElementById('targetWidth_abs'),
		input_targetHeight_abs = document.getElementById('targetHeight_abs'),
		input_targetWidth_rel = document.getElementById('targetWidth_rel'),
		input_targetHeight_rel = document.getElementById('targetHeight_rel'),
		input_handleX_abs = document.getElementById('handleX_abs'),
		input_handleY_abs = document.getElementById('handleY_abs'),
		input_handleX_rel = document.getElementById('handleX_rel'),
		input_handleY_rel = document.getElementById('handleY_rel'),
		input_handleX_str = document.getElementById('handleX_str'),
		input_handleY_str = document.getElementById('handleY_str'),
		input_sourceX_abs = document.getElementById('sourceX_abs'),
		input_sourceY_abs = document.getElementById('sourceY_abs'),
		input_sourceX_rel = document.getElementById('sourceX_rel'),
		input_sourceY_rel = document.getElementById('sourceY_rel'),
		input_sourceWidth_abs = document.getElementById('sourceWidth_abs'),
		input_sourceHeight_abs = document.getElementById('sourceHeight_abs'),
		input_sourceWidth_rel = document.getElementById('sourceWidth_rel'),
		input_sourceHeight_rel = document.getElementById('sourceHeight_rel'),
		input_scale = document.getElementById('scale'),
		input_roll = document.getElementById('roll'),
		input_flip = document.getElementById('flip'),

		data = document.getElementById('data'),

		event_targetX_abs,
		event_targetY_abs,
		event_targetX_rel,
		event_targetY_rel,
		event_targetWidth_abs,
		event_targetHeight_abs,
		event_targetWidth_rel,
		event_targetHeight_rel,
		event_handleX_abs,
		event_handleY_abs,
		event_handleX_rel,
		event_handleY_rel,
		event_handleX_str,
		event_handleY_str,
		event_sourceX_abs,
		event_sourceY_abs,
		event_sourceX_rel,
		event_sourceY_rel,
		event_sourceWidth_abs,
		event_sourceHeight_abs,
		event_sourceWidth_rel,
		event_sourceHeight_rel,
		event_scale,
		event_roll,
		event_flip,

		stopE;

	//import images; setup variables
	scrawl.getImagesByClass('demo111');

	//reconfigure the base cell
	myCell.set({
		usePadDimensions: false,
		backgroundColor: 'lightblue',
		width: 580,
		height: 400,
	});


	//build sprite
	scrawl.newPicture({
		startX: '50%',
		startY: '50%',
		width: 540,
		height: 360,
		handleX: 'center',
		handleY: 'center',
		strokeStyle: 'red',
		lineWidth: 5,
		method: 'fillDraw',
		source: 'cats',
	});

	//sprite is only stamped once - the display cycle will never clear the base cell in this demo
	scrawl.render();

	//set the initial imput values
	input_targetX_abs.value = '0';
	input_targetY_abs.value = '0';
	input_targetX_rel.value = '0';
	input_targetY_rel.value = '0';
	input_targetWidth_abs.value = '580';
	input_targetHeight_abs.value = '400';
	input_targetWidth_rel.value = '100';
	input_targetHeight_rel.value = '100';
	input_handleX_abs.value = '0';
	input_handleY_abs.value = '0';
	input_handleX_rel.value = '0';
	input_handleY_rel.value = '0';
	input_handleX_str.value = 'left';
	input_handleY_str.value = 'top';
	input_sourceX_abs.value = '0';
	input_sourceY_abs.value = '0';
	input_sourceX_rel.value = '0';
	input_sourceY_rel.value = '0';
	input_sourceWidth_abs.value = '580';
	input_sourceHeight_abs.value = '400';
	input_sourceWidth_rel.value = '100';
	input_sourceHeight_rel.value = '100';
	input_scale.value = '1';
	input_roll.value = '0';
	input_flip.value = 'normal';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_targetX_abs = function(e) {
		stopE(e);
		current_targetX = parseInt(input_targetX_abs.value, 10);
		myCell.set({
			targetX: current_targetX,
		});
	};
	input_targetX_abs.addEventListener('input', event_targetX_abs, false);
	input_targetX_abs.addEventListener('change', event_targetX_abs, false);

	event_targetY_abs = function(e) {
		stopE(e);
		current_targetY = parseInt(input_targetY_abs.value, 10);
		myCell.set({
			targetY: current_targetY,
		});
	};
	input_targetY_abs.addEventListener('input', event_targetY_abs, false);
	input_targetY_abs.addEventListener('change', event_targetY_abs, false);

	event_targetX_rel = function(e) {
		stopE(e);
		current_targetX = input_targetX_rel.value + '%';
		myCell.set({
			targetX: current_targetX,
		});
	};
	input_targetX_rel.addEventListener('input', event_targetX_rel, false);
	input_targetX_rel.addEventListener('change', event_targetX_rel, false);

	event_targetY_rel = function(e) {
		stopE(e);
		current_targetY = input_targetY_rel.value + '%';
		myCell.set({
			targetY: current_targetY,
		});
	};
	input_targetY_rel.addEventListener('input', event_targetY_rel, false);
	input_targetY_rel.addEventListener('change', event_targetY_rel, false);

	event_targetWidth_abs = function(e) {
		stopE(e);
		current_targetWidth = parseInt(input_targetWidth_abs.value, 10);
		myCell.set({
			targetWidth: current_targetWidth,
		});
	};
	input_targetWidth_abs.addEventListener('input', event_targetWidth_abs, false);
	input_targetWidth_abs.addEventListener('change', event_targetWidth_abs, false);

	event_targetHeight_abs = function(e) {
		stopE(e);
		current_targetHeight = parseInt(input_targetHeight_abs.value, 10);
		myCell.set({
			targetHeight: current_targetHeight,
		});
	};
	input_targetHeight_abs.addEventListener('input', event_targetHeight_abs, false);
	input_targetHeight_abs.addEventListener('change', event_targetHeight_abs, false);

	event_targetWidth_rel = function(e) {
		stopE(e);
		current_targetWidth = input_targetWidth_rel.value + '%';
		myCell.set({
			targetWidth: current_targetWidth,
		});
	};
	input_targetWidth_rel.addEventListener('input', event_targetWidth_rel, false);
	input_targetWidth_rel.addEventListener('change', event_targetWidth_rel, false);

	event_targetHeight_rel = function(e) {
		stopE(e);
		current_targetHeight = input_targetHeight_rel.value + '%';
		myCell.set({
			targetHeight: current_targetHeight,
		});
	};
	input_targetHeight_rel.addEventListener('input', event_targetHeight_rel, false);
	input_targetHeight_rel.addEventListener('change', event_targetHeight_rel, false);

	event_handleX_abs = function(e) {
		stopE(e);
		current_handleX = parseInt(input_handleX_abs.value, 10);
		myCell.set({
			handleX: current_handleX,
		});
	};
	input_handleX_abs.addEventListener('input', event_handleX_abs, false);
	input_handleX_abs.addEventListener('change', event_handleX_abs, false);

	event_handleY_abs = function(e) {
		stopE(e);
		current_handleY = parseInt(input_handleY_abs.value, 10);
		myCell.set({
			handleY: current_handleY,
		});
	};
	input_handleY_abs.addEventListener('input', event_handleY_abs, false);
	input_handleY_abs.addEventListener('change', event_handleY_abs, false);

	event_handleX_rel = function(e) {
		stopE(e);
		current_handleX = input_handleX_rel.value + '%';
		myCell.set({
			handleX: current_handleX,
		});
	};
	input_handleX_rel.addEventListener('input', event_handleX_rel, false);
	input_handleX_rel.addEventListener('change', event_handleX_rel, false);

	event_handleY_rel = function(e) {
		stopE(e);
		current_handleY = input_handleY_rel.value + '%';
		myCell.set({
			handleY: current_handleY,
		});
	};
	input_handleY_rel.addEventListener('input', event_handleY_rel, false);
	input_handleY_rel.addEventListener('change', event_handleY_rel, false);

	event_handleX_str = function(e) {
		stopE(e);
		current_handleX = input_handleX_str.value;
		myCell.set({
			handleX: current_handleX,
		});
	};
	input_handleX_str.addEventListener('input', event_handleX_str, false);
	input_handleX_str.addEventListener('change', event_handleX_str, false);

	event_handleY_str = function(e) {
		stopE(e);
		current_handleY = input_handleY_str.value;
		myCell.set({
			handleY: current_handleY,
		});
	};
	input_handleY_str.addEventListener('input', event_handleY_str, false);
	input_handleY_str.addEventListener('change', event_handleY_str, false);

	event_sourceX_abs = function(e) {
		stopE(e);
		current_sourceX = parseInt(input_sourceX_abs.value, 10);
		myCell.set({
			sourceX: current_sourceX,
		});
	};
	input_sourceX_abs.addEventListener('input', event_sourceX_abs, false);
	input_sourceX_abs.addEventListener('change', event_sourceX_abs, false);

	event_sourceY_abs = function(e) {
		stopE(e);
		current_sourceY = parseInt(input_sourceY_abs.value, 10);
		myCell.set({
			sourceY: current_sourceY,
		});
	};
	input_sourceY_abs.addEventListener('input', event_sourceY_abs, false);
	input_sourceY_abs.addEventListener('change', event_sourceY_abs, false);

	event_sourceX_rel = function(e) {
		stopE(e);
		current_sourceX = input_sourceX_rel.value + '%';
		myCell.set({
			sourceX: current_sourceX,
		});
	};
	input_sourceX_rel.addEventListener('input', event_sourceX_rel, false);
	input_sourceX_rel.addEventListener('change', event_sourceX_rel, false);

	event_sourceY_rel = function(e) {
		stopE(e);
		current_sourceY = input_sourceY_rel.value + '%';
		myCell.set({
			sourceY: current_sourceY,
		});
	};
	input_sourceY_rel.addEventListener('input', event_sourceY_rel, false);
	input_sourceY_rel.addEventListener('change', event_sourceY_rel, false);

	event_sourceWidth_abs = function(e) {
		stopE(e);
		current_sourceWidth = parseInt(input_sourceWidth_abs.value, 10);
		myCell.set({
			sourceWidth: current_sourceWidth,
		});
	};
	input_sourceWidth_abs.addEventListener('input', event_sourceWidth_abs, false);
	input_sourceWidth_abs.addEventListener('change', event_sourceWidth_abs, false);

	event_sourceHeight_abs = function(e) {
		stopE(e);
		current_sourceHeight = parseInt(input_sourceHeight_abs.value, 10);
		myCell.set({
			sourceHeight: current_sourceHeight,
		});
	};
	input_sourceHeight_abs.addEventListener('input', event_sourceHeight_abs, false);
	input_sourceHeight_abs.addEventListener('change', event_sourceHeight_abs, false);

	event_sourceWidth_rel = function(e) {
		stopE(e);
		current_sourceWidth = input_sourceWidth_rel.value + '%';
		myCell.set({
			sourceWidth: current_sourceWidth,
		});
	};
	input_sourceWidth_rel.addEventListener('input', event_sourceWidth_rel, false);
	input_sourceWidth_rel.addEventListener('change', event_sourceWidth_rel, false);

	event_sourceHeight_rel = function(e) {
		stopE(e);
		current_sourceHeight = input_sourceHeight_rel.value + '%';
		myCell.set({
			sourceHeight: current_sourceHeight,
		});
	};
	input_sourceHeight_rel.addEventListener('input', event_sourceHeight_rel, false);
	input_sourceHeight_rel.addEventListener('change', event_sourceHeight_rel, false);

	event_scale = function(e) {
		stopE(e);
		current_scale = parseFloat(input_scale.value);
		myCell.set({
			scale: current_scale,
		});
	};
	input_scale.addEventListener('input', event_scale, false);
	input_scale.addEventListener('change', event_scale, false);

	event_roll = function(e) {
		stopE(e);
		current_roll = parseInt(input_roll.value, 10);
		myCell.set({
			roll: current_roll,
		});
	};
	input_roll.addEventListener('input', event_roll, false);
	input_roll.addEventListener('change', event_roll, false);

	event_flip = function(e) {
		var r, u;
		stopE(e);
		current_flip = input_flip.value;
		switch (current_flip) {
			case 'reverse':
				r = true;
				u = false;
				break;
			case 'upend':
				r = false;
				u = true;
				break;
			case 'both':
				r = true;
				u = true;
				break;
			default:
				r = false;
				u = false;
		}
		myCell.set({
			flipReverse: r,
			flipUpend: u,
		});
	};
	input_flip.addEventListener('input', event_flip, false);
	input_flip.addEventListener('change', event_flip, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {

			scrawl.show();

			data.innerHTML = '<br />targetX: ' + current_targetX + ', targetY: ' + current_targetY + ', targetWidth: ' + current_targetWidth + ', targetHeight: ' + current_targetHeight + '<br />sourceX: ' + current_sourceX + ', sourceY: ' + current_sourceY + ', sourceWidth: ' + current_sourceWidth + ', sourceHeight: ' + current_sourceHeight + '<br />handleX: ' + current_handleX + ', handleY: ' + current_handleY + ', scale: ' + current_scale + ', roll: ' + current_roll + ', flip: ' + current_flip + '<br />&nbsp;<br />start.x: ' + myCell.start.x + '; start.y: ' + myCell.start.y + '; handle.x: ' + myCell.handle.x + '; handle.y: ' + myCell.handle.y + '; source.x: ' + myCell.source.x + '; source.y: ' + myCell.source.y + '<br />targetWidth: ' + myCell.targetWidth + '; targetHeight: ' + myCell.targetHeight + '; sourceWidth: ' + myCell.sourceWidth + '; sourceHeight: ' + myCell.sourceHeight + '; scale: ' + myCell.scale;

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
	modules: ['wheel', 'images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
