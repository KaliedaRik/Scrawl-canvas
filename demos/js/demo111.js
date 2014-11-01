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

		current_pasteX = 0,
		current_pasteY = 0,
		current_pasteWidth = 580,
		current_pasteHeight = 400,
		current_handleX = 0,
		current_handleY = 0,
		current_copyX = 0,
		current_copyY = 0,
		current_copyWidth = 580,
		current_copyHeight = 400,
		current_scale = 1,
		current_roll = 0,
		current_flip = 'normal',

		input_pasteX_abs = document.getElementById('pasteX_abs'),
		input_pasteY_abs = document.getElementById('pasteY_abs'),
		input_pasteX_rel = document.getElementById('pasteX_rel'),
		input_pasteY_rel = document.getElementById('pasteY_rel'),
		input_pasteWidth_abs = document.getElementById('pasteWidth_abs'),
		input_pasteHeight_abs = document.getElementById('pasteHeight_abs'),
		input_pasteWidth_rel = document.getElementById('pasteWidth_rel'),
		input_pasteHeight_rel = document.getElementById('pasteHeight_rel'),
		input_handleX_abs = document.getElementById('handleX_abs'),
		input_handleY_abs = document.getElementById('handleY_abs'),
		input_handleX_rel = document.getElementById('handleX_rel'),
		input_handleY_rel = document.getElementById('handleY_rel'),
		input_handleX_str = document.getElementById('handleX_str'),
		input_handleY_str = document.getElementById('handleY_str'),
		input_copyX_abs = document.getElementById('copyX_abs'),
		input_copyY_abs = document.getElementById('copyY_abs'),
		input_copyX_rel = document.getElementById('copyX_rel'),
		input_copyY_rel = document.getElementById('copyY_rel'),
		input_copyWidth_abs = document.getElementById('copyWidth_abs'),
		input_copyHeight_abs = document.getElementById('copyHeight_abs'),
		input_copyWidth_rel = document.getElementById('copyWidth_rel'),
		input_copyHeight_rel = document.getElementById('copyHeight_rel'),
		input_scale = document.getElementById('scale'),
		input_roll = document.getElementById('roll'),
		input_flip = document.getElementById('flip'),

		data = document.getElementById('data'),

		event_pasteX_abs,
		event_pasteY_abs,
		event_pasteX_rel,
		event_pasteY_rel,
		event_pasteWidth_abs,
		event_pasteHeight_abs,
		event_pasteWidth_rel,
		event_pasteHeight_rel,
		event_handleX_abs,
		event_handleY_abs,
		event_handleX_rel,
		event_handleY_rel,
		event_handleX_str,
		event_handleY_str,
		event_copyX_abs,
		event_copyY_abs,
		event_copyX_rel,
		event_copyY_rel,
		event_copyWidth_abs,
		event_copyHeight_abs,
		event_copyWidth_rel,
		event_copyHeight_rel,
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


	//build entity
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

	//entity is only stamped once - the display cycle will never clear the base cell in this demo
	scrawl.render();

	//set the initial imput values
	input_pasteX_abs.value = '0';
	input_pasteY_abs.value = '0';
	input_pasteX_rel.value = '0';
	input_pasteY_rel.value = '0';
	input_pasteWidth_abs.value = '580';
	input_pasteHeight_abs.value = '400';
	input_pasteWidth_rel.value = '100';
	input_pasteHeight_rel.value = '100';
	input_handleX_abs.value = '0';
	input_handleY_abs.value = '0';
	input_handleX_rel.value = '0';
	input_handleY_rel.value = '0';
	input_handleX_str.value = 'left';
	input_handleY_str.value = 'top';
	input_copyX_abs.value = '0';
	input_copyY_abs.value = '0';
	input_copyX_rel.value = '0';
	input_copyY_rel.value = '0';
	input_copyWidth_abs.value = '580';
	input_copyHeight_abs.value = '400';
	input_copyWidth_rel.value = '100';
	input_copyHeight_rel.value = '100';
	input_scale.value = '1';
	input_roll.value = '0';
	input_flip.value = 'normal';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_pasteX_abs = function(e) {
		stopE(e);
		current_pasteX = parseInt(input_pasteX_abs.value, 10);
		myCell.set({
			pasteX: current_pasteX,
		});
	};
	input_pasteX_abs.addEventListener('input', event_pasteX_abs, false);
	input_pasteX_abs.addEventListener('change', event_pasteX_abs, false);

	event_pasteY_abs = function(e) {
		stopE(e);
		current_pasteY = parseInt(input_pasteY_abs.value, 10);
		myCell.set({
			pasteY: current_pasteY,
		});
	};
	input_pasteY_abs.addEventListener('input', event_pasteY_abs, false);
	input_pasteY_abs.addEventListener('change', event_pasteY_abs, false);

	event_pasteX_rel = function(e) {
		stopE(e);
		current_pasteX = input_pasteX_rel.value + '%';
		myCell.set({
			pasteX: current_pasteX,
		});
	};
	input_pasteX_rel.addEventListener('input', event_pasteX_rel, false);
	input_pasteX_rel.addEventListener('change', event_pasteX_rel, false);

	event_pasteY_rel = function(e) {
		stopE(e);
		current_pasteY = input_pasteY_rel.value + '%';
		myCell.set({
			pasteY: current_pasteY,
		});
	};
	input_pasteY_rel.addEventListener('input', event_pasteY_rel, false);
	input_pasteY_rel.addEventListener('change', event_pasteY_rel, false);

	event_pasteWidth_abs = function(e) {
		stopE(e);
		current_pasteWidth = parseInt(input_pasteWidth_abs.value, 10);
		myCell.set({
			pasteWidth: current_pasteWidth,
		});
	};
	input_pasteWidth_abs.addEventListener('input', event_pasteWidth_abs, false);
	input_pasteWidth_abs.addEventListener('change', event_pasteWidth_abs, false);

	event_pasteHeight_abs = function(e) {
		stopE(e);
		current_pasteHeight = parseInt(input_pasteHeight_abs.value, 10);
		myCell.set({
			pasteHeight: current_pasteHeight,
		});
	};
	input_pasteHeight_abs.addEventListener('input', event_pasteHeight_abs, false);
	input_pasteHeight_abs.addEventListener('change', event_pasteHeight_abs, false);

	event_pasteWidth_rel = function(e) {
		stopE(e);
		current_pasteWidth = input_pasteWidth_rel.value + '%';
		myCell.set({
			pasteWidth: current_pasteWidth,
		});
	};
	input_pasteWidth_rel.addEventListener('input', event_pasteWidth_rel, false);
	input_pasteWidth_rel.addEventListener('change', event_pasteWidth_rel, false);

	event_pasteHeight_rel = function(e) {
		stopE(e);
		current_pasteHeight = input_pasteHeight_rel.value + '%';
		myCell.set({
			pasteHeight: current_pasteHeight,
		});
	};
	input_pasteHeight_rel.addEventListener('input', event_pasteHeight_rel, false);
	input_pasteHeight_rel.addEventListener('change', event_pasteHeight_rel, false);

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

	event_copyX_abs = function(e) {
		stopE(e);
		current_copyX = parseInt(input_copyX_abs.value, 10);
		myCell.set({
			copyX: current_copyX,
		});
	};
	input_copyX_abs.addEventListener('input', event_copyX_abs, false);
	input_copyX_abs.addEventListener('change', event_copyX_abs, false);

	event_copyY_abs = function(e) {
		stopE(e);
		current_copyY = parseInt(input_copyY_abs.value, 10);
		myCell.set({
			copyY: current_copyY,
		});
	};
	input_copyY_abs.addEventListener('input', event_copyY_abs, false);
	input_copyY_abs.addEventListener('change', event_copyY_abs, false);

	event_copyX_rel = function(e) {
		stopE(e);
		current_copyX = input_copyX_rel.value + '%';
		myCell.set({
			copyX: current_copyX,
		});
	};
	input_copyX_rel.addEventListener('input', event_copyX_rel, false);
	input_copyX_rel.addEventListener('change', event_copyX_rel, false);

	event_copyY_rel = function(e) {
		stopE(e);
		current_copyY = input_copyY_rel.value + '%';
		myCell.set({
			copyY: current_copyY,
		});
	};
	input_copyY_rel.addEventListener('input', event_copyY_rel, false);
	input_copyY_rel.addEventListener('change', event_copyY_rel, false);

	event_copyWidth_abs = function(e) {
		stopE(e);
		current_copyWidth = parseInt(input_copyWidth_abs.value, 10);
		myCell.set({
			copyWidth: current_copyWidth,
		});
	};
	input_copyWidth_abs.addEventListener('input', event_copyWidth_abs, false);
	input_copyWidth_abs.addEventListener('change', event_copyWidth_abs, false);

	event_copyHeight_abs = function(e) {
		stopE(e);
		current_copyHeight = parseInt(input_copyHeight_abs.value, 10);
		myCell.set({
			copyHeight: current_copyHeight,
		});
	};
	input_copyHeight_abs.addEventListener('input', event_copyHeight_abs, false);
	input_copyHeight_abs.addEventListener('change', event_copyHeight_abs, false);

	event_copyWidth_rel = function(e) {
		stopE(e);
		current_copyWidth = input_copyWidth_rel.value + '%';
		myCell.set({
			copyWidth: current_copyWidth,
		});
	};
	input_copyWidth_rel.addEventListener('input', event_copyWidth_rel, false);
	input_copyWidth_rel.addEventListener('change', event_copyWidth_rel, false);

	event_copyHeight_rel = function(e) {
		stopE(e);
		current_copyHeight = input_copyHeight_rel.value + '%';
		myCell.set({
			copyHeight: current_copyHeight,
		});
	};
	input_copyHeight_rel.addEventListener('input', event_copyHeight_rel, false);
	input_copyHeight_rel.addEventListener('change', event_copyHeight_rel, false);

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

			data.innerHTML = '<br />pasteX: ' + current_pasteX + ', pasteY: ' + current_pasteY + ', pasteWidth: ' + current_pasteWidth + ', pasteHeight: ' + current_pasteHeight + '<br />copyX: ' + current_copyX + ', copyY: ' + current_copyY + ', copyWidth: ' + current_copyWidth + ', copyHeight: ' + current_copyHeight + '<br />handleX: ' + current_handleX + ', handleY: ' + current_handleY + ', scale: ' + current_scale + ', roll: ' + current_roll + ', flip: ' + current_flip + '<br />&nbsp;<br />start.x: ' + myCell.start.x + '; start.y: ' + myCell.start.y + '; handle.x: ' + myCell.handle.x + '; handle.y: ' + myCell.handle.y + '; copy.x: ' + myCell.copy.x + '; copy.y: ' + myCell.copy.y + '<br />pasteWidth: ' + myCell.pasteWidth + '; pasteHeight: ' + myCell.pasteHeight + '; copyWidth: ' + myCell.copyWidth + '; copyHeight: ' + myCell.copyHeight + '; scale: ' + myCell.scale;

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
