var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//DEFINE VARIABLES

	//shorthand variables for manipulating each stack and element
	var bluestack = scrawl.stack.mainstack,
		bluepara = scrawl.element.maincopytext,
		redstack = scrawl.stack.substack,
		redpara = scrawl.element.subcopytext,

		//initial settings for stack and element control values
		current_bluestack_scale = 1,

		current_redstack_scale = 1,
		current_redstackstart_x = 0,
		current_redstackstart_y = 0,
		current_redstackhandle_x = 0,
		current_redstackhandle_y = 0,

		current_blueparastart_x = 'center',
		current_blueparastart_y = 'center',
		current_blueparahandle_x = 'center',
		current_blueparahandle_y = 'center',

		current_redparastart_x = 'center',
		current_redparastart_y = 'center',
		current_redparahandle_x = 'center',
		current_redparahandle_y = 'center',

		//grabbing the controller elements (which are not part of the stack)
		input_bluestack_scale = document.getElementById('bluestack_scale'),
		event_bluestack_scale,

		input_redstack_scale = document.getElementById('redstack_scale'),
		input_redstackstart_xPercent = document.getElementById('redstackstart_xPercent'),
		input_redstackstart_yPercent = document.getElementById('redstackstart_yPercent'),
		input_redstackstart_xAbsolute = document.getElementById('redstackstart_xAbsolute'),
		input_redstackstart_yAbsolute = document.getElementById('redstackstart_yAbsolute'),
		input_redstackstart_xString = document.getElementById('redstackstart_xString'),
		input_redstackstart_yString = document.getElementById('redstackstart_yString'),
		input_redstackhandle_xPercent = document.getElementById('redstackhandle_xPercent'),
		input_redstackhandle_yPercent = document.getElementById('redstackhandle_yPercent'),
		input_redstackhandle_xAbsolute = document.getElementById('redstackhandle_xAbsolute'),
		input_redstackhandle_yAbsolute = document.getElementById('redstackhandle_yAbsolute'),
		input_redstackhandle_xString = document.getElementById('redstackhandle_xString'),
		input_redstackhandle_yString = document.getElementById('redstackhandle_yString'),
		event_redstack_scale,
		event_redstackstart_xPercent,
		event_redstackstart_yPercent,
		event_redstackstart_xAbsolute,
		event_redstackstart_yAbsolute,
		event_redstackstart_xString,
		event_redstackstart_yString,
		event_redstackhandle_xPercent,
		event_redstackhandle_yPercent,
		event_redstackhandle_xAbsolute,
		event_redstackhandle_yAbsolute,
		event_redstackhandle_xString,
		event_redstackhandle_yString,

		input_blueparastart_xPercent = document.getElementById('blueparastart_xPercent'),
		input_blueparastart_yPercent = document.getElementById('blueparastart_yPercent'),
		input_blueparastart_xAbsolute = document.getElementById('blueparastart_xAbsolute'),
		input_blueparastart_yAbsolute = document.getElementById('blueparastart_yAbsolute'),
		input_blueparastart_xString = document.getElementById('blueparastart_xString'),
		input_blueparastart_yString = document.getElementById('blueparastart_yString'),
		input_blueparahandle_xPercent = document.getElementById('blueparahandle_xPercent'),
		input_blueparahandle_yPercent = document.getElementById('blueparahandle_yPercent'),
		input_blueparahandle_xAbsolute = document.getElementById('blueparahandle_xAbsolute'),
		input_blueparahandle_yAbsolute = document.getElementById('blueparahandle_yAbsolute'),
		input_blueparahandle_xString = document.getElementById('blueparahandle_xString'),
		input_blueparahandle_yString = document.getElementById('blueparahandle_yString'),
		event_blueparastart_xPercent,
		event_blueparastart_yPercent,
		event_blueparastart_xAbsolute,
		event_blueparastart_yAbsolute,
		event_blueparastart_xString,
		event_blueparastart_yString,
		event_blueparahandle_xPercent,
		event_blueparahandle_yPercent,
		event_blueparahandle_xAbsolute,
		event_blueparahandle_yAbsolute,
		event_blueparahandle_xString,
		event_blueparahandle_yString,

		input_redparastart_xPercent = document.getElementById('redparastart_xPercent'),
		input_redparastart_yPercent = document.getElementById('redparastart_yPercent'),
		input_redparastart_xAbsolute = document.getElementById('redparastart_xAbsolute'),
		input_redparastart_yAbsolute = document.getElementById('redparastart_yAbsolute'),
		input_redparastart_xString = document.getElementById('redparastart_xString'),
		input_redparastart_yString = document.getElementById('redparastart_yString'),
		input_redparahandle_xPercent = document.getElementById('redparahandle_xPercent'),
		input_redparahandle_yPercent = document.getElementById('redparahandle_yPercent'),
		input_redparahandle_xAbsolute = document.getElementById('redparahandle_xAbsolute'),
		input_redparahandle_yAbsolute = document.getElementById('redparahandle_yAbsolute'),
		input_redparahandle_xString = document.getElementById('redparahandle_xString'),
		input_redparahandle_yString = document.getElementById('redparahandle_yString'),
		event_redparastart_xPercent,
		event_redparastart_yPercent,
		event_redparastart_xAbsolute,
		event_redparastart_yAbsolute,
		event_redparastart_xString,
		event_redparastart_yString,
		event_redparahandle_xPercent,
		event_redparahandle_yPercent,
		event_redparahandle_xAbsolute,
		event_redparahandle_yAbsolute,
		event_redparahandle_xString,
		event_redparahandle_yString,

		//grabbing the status div
		status = document.getElementById('status'),

		//functions
		stopE;

	//set stacks and elements to initial values
	bluestack.set({
		width: 600,
		height: 600,
		target: 'both',
		borderColor: 'blue',
	});
	bluepara.set({
		width: '50%',
		borderColor: 'lightblue',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
	});
	redstack.set({
		width: '50%',
		height: '50%',
		position: 'absolute',
		borderColor: 'red',
	});
	redpara.set({
		width: '50%',
		borderColor: 'pink',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
	});

	//setup circles to mark the start (rotation/reflection) points for each stack and element
	scrawl.newWheel({
		name: 'substackWheel',
		pivot: 'substack',
		fillStyle: 'red',
		radius: 10,
	}).clone({
		name: 'maincopytextWheel',
		pivot: 'maincopytext',
		fillStyle: 'lightblue',
	}).clone({
		name: 'subcopytextWheel',
		pivot: 'subcopytext',
		fillStyle: 'pink',
		group: scrawl.pad[redstack.canvas].base,
	});

	//initial values for the input controllers
	input_bluestack_scale.value = 1;

	input_redstack_scale.value = 1;
	input_redstackstart_xPercent.value = 0;
	input_redstackstart_yPercent.value = 0;
	input_redstackstart_xAbsolute.value = 0;
	input_redstackstart_yAbsolute.value = 0;
	input_redstackstart_xString.options.selectedIndex = 0;
	input_redstackstart_yString.options.selectedIndex = 0;
	input_redstackhandle_xPercent.value = 0;
	input_redstackhandle_yPercent.value = 0;
	input_redstackhandle_xAbsolute.value = 0;
	input_redstackhandle_yAbsolute.value = 0;
	input_redstackhandle_xString.options.selectedIndex = 0;
	input_redstackhandle_yString.options.selectedIndex = 0;

	input_blueparastart_xPercent.value = 0;
	input_blueparastart_yPercent.value = 0;
	input_blueparastart_xAbsolute.value = 0;
	input_blueparastart_yAbsolute.value = 0;
	input_blueparastart_xString.options.selectedIndex = 1;
	input_blueparastart_yString.options.selectedIndex = 1;
	input_blueparahandle_xPercent.value = 0;
	input_blueparahandle_yPercent.value = 0;
	input_blueparahandle_xAbsolute.value = 0;
	input_blueparahandle_yAbsolute.value = 0;
	input_blueparahandle_xString.options.selectedIndex = 1;
	input_blueparahandle_yString.options.selectedIndex = 1;

	input_redparastart_xPercent.value = 0;
	input_redparastart_yPercent.value = 0;
	input_redparastart_xAbsolute.value = 0;
	input_redparastart_yAbsolute.value = 0;
	input_redparastart_xString.options.selectedIndex = 1;
	input_redparastart_yString.options.selectedIndex = 1;
	input_redparahandle_xPercent.value = 0;
	input_redparahandle_yPercent.value = 0;
	input_redparahandle_xAbsolute.value = 0;
	input_redparahandle_yAbsolute.value = 0;
	input_redparahandle_xString.options.selectedIndex = 1;
	input_redparahandle_yString.options.selectedIndex = 1;

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	event_bluestack_scale = function(e) {
		stopE(e);
		current_bluestack_scale = input_bluestack_scale.value;
		bluestack.set({
			scale: current_bluestack_scale,
		});
	};
	input_bluestack_scale.addEventListener('input', event_bluestack_scale, false);
	input_bluestack_scale.addEventListener('change', event_bluestack_scale, false);

	event_redstack_scale = function(e) {
		stopE(e);
		current_redstack_scale = input_redstack_scale.value;
		redstack.set({
			scale: current_redstack_scale,
		});
	};
	input_redstack_scale.addEventListener('input', event_redstack_scale, false);
	input_redstack_scale.addEventListener('change', event_redstack_scale, false);
	event_redstackstart_xPercent = function(e) {
		stopE(e);
		current_redstackstart_x = input_redstackstart_xPercent.value + '%';
		redstack.set({
			startX: current_redstackstart_x,
		});
	};
	input_redstackstart_xPercent.addEventListener('input', event_redstackstart_xPercent, false);
	input_redstackstart_xPercent.addEventListener('change', event_redstackstart_xPercent, false);
	event_redstackstart_yPercent = function(e) {
		stopE(e);
		current_redstackstart_y = input_redstackstart_yPercent.value + '%';
		redstack.set({
			startY: current_redstackstart_y,
		});
	};
	input_redstackstart_yPercent.addEventListener('input', event_redstackstart_yPercent, false);
	input_redstackstart_yPercent.addEventListener('change', event_redstackstart_yPercent, false);
	event_redstackstart_xAbsolute = function(e) {
		stopE(e);
		current_redstackstart_x = Math.round(input_redstackstart_xAbsolute.value);
		redstack.set({
			startX: current_redstackstart_x,
		});
	};
	input_redstackstart_xAbsolute.addEventListener('input', event_redstackstart_xAbsolute, false);
	input_redstackstart_xAbsolute.addEventListener('change', event_redstackstart_xAbsolute, false);
	event_redstackstart_yAbsolute = function(e) {
		stopE(e);
		current_redstackstart_y = Math.round(input_redstackstart_yAbsolute.value);
		redstack.set({
			startY: current_redstackstart_y,
		});
	};
	input_redstackstart_yAbsolute.addEventListener('input', event_redstackstart_yAbsolute, false);
	input_redstackstart_yAbsolute.addEventListener('change', event_redstackstart_yAbsolute, false);
	event_redstackstart_xString = function(e) {
		stopE(e);
		current_redstackstart_x = input_redstackstart_xString.value;
		redstack.set({
			startX: current_redstackstart_x,
		});
	};
	input_redstackstart_xString.addEventListener('input', event_redstackstart_xString, false);
	input_redstackstart_xString.addEventListener('change', event_redstackstart_xString, false);
	event_redstackstart_yString = function(e) {
		stopE(e);
		current_redstackstart_y = input_redstackstart_yString.value;
		redstack.set({
			startY: current_redstackstart_y,
		});
	};
	input_redstackstart_yString.addEventListener('input', event_redstackstart_yString, false);
	input_redstackstart_yString.addEventListener('change', event_redstackstart_yString, false);
	event_redstackhandle_xPercent = function(e) {
		stopE(e);
		current_redstackhandle_x = input_redstackhandle_xPercent.value + '%';
		redstack.set({
			handleX: current_redstackhandle_x,
		});
	};
	input_redstackhandle_xPercent.addEventListener('input', event_redstackhandle_xPercent, false);
	input_redstackhandle_xPercent.addEventListener('change', event_redstackhandle_xPercent, false);
	event_redstackhandle_yPercent = function(e) {
		stopE(e);
		current_redstackhandle_y = input_redstackhandle_yPercent.value + '%';
		redstack.set({
			handleY: current_redstackhandle_y,
		});
	};
	input_redstackhandle_yPercent.addEventListener('input', event_redstackhandle_yPercent, false);
	input_redstackhandle_yPercent.addEventListener('change', event_redstackhandle_yPercent, false);
	event_redstackhandle_xAbsolute = function(e) {
		stopE(e);
		current_redstackhandle_x = Math.round(input_redstackhandle_xAbsolute.value);
		redstack.set({
			handleX: current_redstackhandle_x,
		});
	};
	input_redstackhandle_xAbsolute.addEventListener('input', event_redstackhandle_xAbsolute, false);
	input_redstackhandle_xAbsolute.addEventListener('change', event_redstackhandle_xAbsolute, false);
	event_redstackhandle_yAbsolute = function(e) {
		stopE(e);
		current_redstackhandle_y = Math.round(input_redstackhandle_yAbsolute.value);
		redstack.set({
			handleY: current_redstackhandle_y,
		});
	};
	input_redstackhandle_yAbsolute.addEventListener('input', event_redstackhandle_yAbsolute, false);
	input_redstackhandle_yAbsolute.addEventListener('change', event_redstackhandle_yAbsolute, false);
	event_redstackhandle_xString = function(e) {
		stopE(e);
		current_redstackhandle_x = input_redstackhandle_xString.value;
		redstack.set({
			handleX: current_redstackhandle_x,
		});
	};
	input_redstackhandle_xString.addEventListener('input', event_redstackhandle_xString, false);
	input_redstackhandle_xString.addEventListener('change', event_redstackhandle_xString, false);
	event_redstackhandle_yString = function(e) {
		stopE(e);
		current_redstackhandle_y = input_redstackhandle_yString.value;
		redstack.set({
			handleY: current_redstackhandle_y,
		});
	};
	input_redstackhandle_yString.addEventListener('input', event_redstackhandle_yString, false);
	input_redstackhandle_yString.addEventListener('change', event_redstackhandle_yString, false);

	event_blueparastart_xPercent = function(e) {
		stopE(e);
		current_blueparastart_x = input_blueparastart_xPercent.value + '%';
		bluepara.set({
			startX: current_blueparastart_x,
		});
	};
	input_blueparastart_xPercent.addEventListener('input', event_blueparastart_xPercent, false);
	input_blueparastart_xPercent.addEventListener('change', event_blueparastart_xPercent, false);
	event_blueparastart_yPercent = function(e) {
		stopE(e);
		current_blueparastart_y = input_blueparastart_yPercent.value + '%';
		bluepara.set({
			startY: current_blueparastart_y,
		});
	};
	input_blueparastart_yPercent.addEventListener('input', event_blueparastart_yPercent, false);
	input_blueparastart_yPercent.addEventListener('change', event_blueparastart_yPercent, false);
	event_blueparastart_xAbsolute = function(e) {
		stopE(e);
		current_blueparastart_x = Math.round(input_blueparastart_xAbsolute.value);
		bluepara.set({
			startX: current_blueparastart_x,
		});
	};
	input_blueparastart_xAbsolute.addEventListener('input', event_blueparastart_xAbsolute, false);
	input_blueparastart_xAbsolute.addEventListener('change', event_blueparastart_xAbsolute, false);
	event_blueparastart_yAbsolute = function(e) {
		stopE(e);
		current_blueparastart_y = Math.round(input_blueparastart_yAbsolute.value);
		bluepara.set({
			startY: current_blueparastart_y,
		});
	};
	input_blueparastart_yAbsolute.addEventListener('input', event_blueparastart_yAbsolute, false);
	input_blueparastart_yAbsolute.addEventListener('change', event_blueparastart_yAbsolute, false);
	event_blueparastart_xString = function(e) {
		stopE(e);
		current_blueparastart_x = input_blueparastart_xString.value;
		bluepara.set({
			startX: current_blueparastart_x,
		});
	};
	input_blueparastart_xString.addEventListener('input', event_blueparastart_xString, false);
	input_blueparastart_xString.addEventListener('change', event_blueparastart_xString, false);
	event_blueparastart_yString = function(e) {
		stopE(e);
		current_blueparastart_y = input_blueparastart_yString.value;
		bluepara.set({
			startY: current_blueparastart_y,
		});
	};
	input_blueparastart_yString.addEventListener('input', event_blueparastart_yString, false);
	input_blueparastart_yString.addEventListener('change', event_blueparastart_yString, false);
	event_blueparahandle_xPercent = function(e) {
		stopE(e);
		current_blueparahandle_x = input_blueparahandle_xPercent.value + '%';
		bluepara.set({
			handleX: current_blueparahandle_x,
		});
	};
	input_blueparahandle_xPercent.addEventListener('input', event_blueparahandle_xPercent, false);
	input_blueparahandle_xPercent.addEventListener('change', event_blueparahandle_xPercent, false);
	event_blueparahandle_yPercent = function(e) {
		stopE(e);
		current_blueparahandle_y = input_blueparahandle_yPercent.value + '%';
		bluepara.set({
			handleY: current_blueparahandle_y,
		});
	};
	input_blueparahandle_yPercent.addEventListener('input', event_blueparahandle_yPercent, false);
	input_blueparahandle_yPercent.addEventListener('change', event_blueparahandle_yPercent, false);
	event_blueparahandle_xAbsolute = function(e) {
		stopE(e);
		current_blueparahandle_x = Math.round(input_blueparahandle_xAbsolute.value);
		bluepara.set({
			handleX: current_blueparahandle_x,
		});
	};
	input_blueparahandle_xAbsolute.addEventListener('input', event_blueparahandle_xAbsolute, false);
	input_blueparahandle_xAbsolute.addEventListener('change', event_blueparahandle_xAbsolute, false);
	event_blueparahandle_yAbsolute = function(e) {
		stopE(e);
		current_blueparahandle_y = Math.round(input_blueparahandle_yAbsolute.value);
		bluepara.set({
			handleY: current_blueparahandle_y,
		});
	};
	input_blueparahandle_yAbsolute.addEventListener('input', event_blueparahandle_yAbsolute, false);
	input_blueparahandle_yAbsolute.addEventListener('change', event_blueparahandle_yAbsolute, false);
	event_blueparahandle_xString = function(e) {
		stopE(e);
		current_blueparahandle_x = input_blueparahandle_xString.value;
		bluepara.set({
			handleX: current_blueparahandle_x,
		});
	};
	input_blueparahandle_xString.addEventListener('input', event_blueparahandle_xString, false);
	input_blueparahandle_xString.addEventListener('change', event_blueparahandle_xString, false);
	event_blueparahandle_yString = function(e) {
		stopE(e);
		current_blueparahandle_y = input_blueparahandle_yString.value;
		bluepara.set({
			handleY: current_blueparahandle_y,
		});
	};
	input_blueparahandle_yString.addEventListener('input', event_blueparahandle_yString, false);
	input_blueparahandle_yString.addEventListener('change', event_blueparahandle_yString, false);

	event_redparastart_xPercent = function(e) {
		stopE(e);
		current_redparastart_x = input_redparastart_xPercent.value + '%';
		redpara.set({
			startX: current_redparastart_x,
		});
	};
	input_redparastart_xPercent.addEventListener('input', event_redparastart_xPercent, false);
	input_redparastart_xPercent.addEventListener('change', event_redparastart_xPercent, false);
	event_redparastart_yPercent = function(e) {
		stopE(e);
		current_redparastart_y = input_redparastart_yPercent.value + '%';
		redpara.set({
			startY: current_redparastart_y,
		});
	};
	input_redparastart_yPercent.addEventListener('input', event_redparastart_yPercent, false);
	input_redparastart_yPercent.addEventListener('change', event_redparastart_yPercent, false);
	event_redparastart_xAbsolute = function(e) {
		stopE(e);
		current_redparastart_x = Math.round(input_redparastart_xAbsolute.value);
		redpara.set({
			startX: current_redparastart_x,
		});
	};
	input_redparastart_xAbsolute.addEventListener('input', event_redparastart_xAbsolute, false);
	input_redparastart_xAbsolute.addEventListener('change', event_redparastart_xAbsolute, false);
	event_redparastart_yAbsolute = function(e) {
		stopE(e);
		current_redparastart_y = Math.round(input_redparastart_yAbsolute.value);
		redpara.set({
			startY: current_redparastart_y,
		});
	};
	input_redparastart_yAbsolute.addEventListener('input', event_redparastart_yAbsolute, false);
	input_redparastart_yAbsolute.addEventListener('change', event_redparastart_yAbsolute, false);
	event_redparastart_xString = function(e) {
		stopE(e);
		current_redparastart_x = input_redparastart_xString.value;
		redpara.set({
			startX: current_redparastart_x,
		});
	};
	input_redparastart_xString.addEventListener('input', event_redparastart_xString, false);
	input_redparastart_xString.addEventListener('change', event_redparastart_xString, false);
	event_redparastart_yString = function(e) {
		stopE(e);
		current_redparastart_y = input_redparastart_yString.value;
		redpara.set({
			startY: current_redparastart_y,
		});
	};
	input_redparastart_yString.addEventListener('input', event_redparastart_yString, false);
	input_redparastart_yString.addEventListener('change', event_redparastart_yString, false);
	event_redparahandle_xPercent = function(e) {
		stopE(e);
		current_redparahandle_x = input_redparahandle_xPercent.value + '%';
		redpara.set({
			handleX: current_redparahandle_x,
		});
	};
	input_redparahandle_xPercent.addEventListener('input', event_redparahandle_xPercent, false);
	input_redparahandle_xPercent.addEventListener('change', event_redparahandle_xPercent, false);
	event_redparahandle_yPercent = function(e) {
		stopE(e);
		current_redparahandle_y = input_redparahandle_yPercent.value + '%';
		redpara.set({
			handleY: current_redparahandle_y,
		});
	};
	input_redparahandle_yPercent.addEventListener('input', event_redparahandle_yPercent, false);
	input_redparahandle_yPercent.addEventListener('change', event_redparahandle_yPercent, false);
	event_redparahandle_xAbsolute = function(e) {
		stopE(e);
		current_redparahandle_x = Math.round(input_redparahandle_xAbsolute.value);
		redpara.set({
			handleX: current_redparahandle_x,
		});
	};
	input_redparahandle_xAbsolute.addEventListener('input', event_redparahandle_xAbsolute, false);
	input_redparahandle_xAbsolute.addEventListener('change', event_redparahandle_xAbsolute, false);
	event_redparahandle_yAbsolute = function(e) {
		stopE(e);
		current_redparahandle_y = Math.round(input_redparahandle_yAbsolute.value);
		redpara.set({
			handleY: current_redparahandle_y,
		});
	};
	input_redparahandle_yAbsolute.addEventListener('input', event_redparahandle_yAbsolute, false);
	input_redparahandle_yAbsolute.addEventListener('change', event_redparahandle_yAbsolute, false);
	event_redparahandle_xString = function(e) {
		stopE(e);
		current_redparahandle_x = input_redparahandle_xString.value;
		redpara.set({
			handleX: current_redparahandle_x,
		});
	};
	input_redparahandle_xString.addEventListener('input', event_redparahandle_xString, false);
	input_redparahandle_xString.addEventListener('change', event_redparahandle_xString, false);
	event_redparahandle_yString = function(e) {
		stopE(e);
		current_redparahandle_y = input_redparahandle_yString.value;
		redpara.set({
			handleY: current_redparahandle_y,
		});
	};
	input_redparahandle_yString.addEventListener('input', event_redparahandle_yString, false);
	input_redparahandle_yString.addEventListener('change', event_redparahandle_yString, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {

			//move stacks and elements in line with controller input
			scrawl.renderElements();

			//move circles in line with their stack and element pivots
			scrawl.render();

			//report on the current values of each controller
			status.innerHTML = '<b>Blue stack settings - scale:</b> ' + current_bluestack_scale +
				'<br /><b>Blue paragraph settings - startX:</b> ' + current_blueparastart_x +
				'; <b>startY:</b> ' + current_blueparastart_y +
				'; <b>handleX:</b> ' + current_blueparahandle_x +
				'; <b>handleY:</b> ' + current_blueparahandle_y +
				'<br /><b>Red stack settings - scale:</b> ' + current_redstack_scale +
				'; <b>startX:</b> ' + current_redstackstart_x +
				'; <b>startY:</b> ' + current_redstackstart_y +
				'; <b>handleX:</b> ' + current_redstackhandle_x +
				'; <b>handleY:</b> ' + current_redstackhandle_y +
				'<br /><b>Pink paragraph settings - startX:</b> ' + current_redparastart_x +
				'; <b>startY:</b> ' + current_redparastart_y +
				'; <b>handleX:</b> ' + current_redparahandle_x +
				'; <b>handleY:</b> ' + current_redparahandle_y;

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

//module loading and initialization function
scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['stacks', 'animation', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
