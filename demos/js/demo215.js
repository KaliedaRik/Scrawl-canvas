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
		pinkpara = scrawl.element.myparagraph,

		//initial settings for stack and element control values
		current_bluestack_scale = 1,

		current_bluepara_width = '50%',
		current_bluepara_height = '0%',
		current_blueparastart_x = 'center',
		current_blueparastart_y = 'center',
		current_blueparahandle_x = 'center',
		current_blueparahandle_y = 'center',
		current_borderWidth = 1,
		current_padding = 0,
		current_boxSizing = 'content-box',
		current_borderStyle = 'solid',

		//grabbing the controller elements (which are not part of the stack)
		input_bluestack_scale = document.getElementById('bluestack_scale'),
		event_bluestack_scale,

		input_bluepara_widthPercent = document.getElementById('bluepara_widthPercent'),
		input_bluepara_heightPercent = document.getElementById('bluepara_heightPercent'),
		input_bluepara_widthAbsolute = document.getElementById('bluepara_widthAbsolute'),
		input_bluepara_heightAbsolute = document.getElementById('bluepara_heightAbsolute'),
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
		input_borderWidth = document.getElementById('borderWidth'),
		input_padding = document.getElementById('padding'),
		input_boxSizing = document.getElementById('boxSizing'),
		input_borderStyle = document.getElementById('borderStyle'),

		event_bluepara_widthPercent,
		event_bluepara_heightPercent,
		event_bluepara_widthAbsolute,
		event_bluepara_heightAbsolute,
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
		event_borderWidth,
		event_padding,
		event_boxSizing,
		event_borderStyle,

		//grabbing the status div
		status = document.getElementById('status'),

		//functions
		stopE;

	//set stacks and elements to initial values
	bluestack.set({
		width: 600,
		height: 600,
		target: 'both',
		border: '1px solid blue',
	});
	bluepara.set({
		width: '50%',
		height: '0%',
		border: '1px solid lightblue',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
	});
	pinkpara.set({
		height: 0,
		border: '1px solid pink',
		pivot: 'maincopytext',
		lockTo: 'bottom',
	});

	//initial values for the input controllers
	input_bluestack_scale.value = 1;

	input_bluepara_widthPercent.value = 50;
	input_bluepara_heightPercent.value = 0;
	input_bluepara_widthAbsolute.value = 300;
	input_bluepara_heightAbsolute.value = 300;
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
	input_borderWidth.value = 1;
	input_padding.value = 0;
	input_boxSizing.options.selectedIndex = 0;
	input_borderStyle.options.selectedIndex = 0;

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

	event_boxSizing = function(e) {
		stopE(e);
		current_boxSizing = input_boxSizing.value;
		bluepara.set({
			boxSizing: current_boxSizing,
		});
	};
	input_boxSizing.addEventListener('change', event_boxSizing, false);
	event_borderStyle = function(e) {
		stopE(e);
		current_borderStyle = input_borderStyle.value;
		bluepara.set({
			borderStyle: current_borderStyle,
		});
	};
	input_borderStyle.addEventListener('change', event_borderStyle, false);
	event_borderWidth = function(e) {
		stopE(e);
		current_borderWidth = input_borderWidth.value + 'px';
		bluepara.set({
			borderWidth: current_borderWidth,
		});
	};
	input_borderWidth.addEventListener('input', event_borderWidth, false);
	input_borderWidth.addEventListener('change', event_borderWidth, false);
	event_padding = function(e) {
		stopE(e);
		current_padding = input_padding.value + 'px';
		bluepara.set({
			padding: current_padding,
		});
	};
	input_padding.addEventListener('input', event_padding, false);
	input_padding.addEventListener('change', event_padding, false);
	event_bluepara_widthPercent = function(e) {
		stopE(e);
		current_bluepara_width = input_bluepara_widthPercent.value + '%';
		bluepara.set({
			width: current_bluepara_width,
		});
	};
	input_bluepara_widthPercent.addEventListener('input', event_bluepara_widthPercent, false);
	input_bluepara_widthPercent.addEventListener('change', event_bluepara_widthPercent, false);
	event_bluepara_heightPercent = function(e) {
		stopE(e);
		current_bluepara_height = input_bluepara_heightPercent.value + '%';
		bluepara.set({
			height: current_bluepara_height,
		});
	};
	input_bluepara_heightPercent.addEventListener('input', event_bluepara_heightPercent, false);
	input_bluepara_heightPercent.addEventListener('change', event_bluepara_heightPercent, false);
	event_bluepara_widthAbsolute = function(e) {
		stopE(e);
		current_bluepara_width = parseFloat(input_bluepara_widthAbsolute.value);
		bluepara.set({
			width: current_bluepara_width,
		});
	};
	input_bluepara_widthAbsolute.addEventListener('input', event_bluepara_widthAbsolute, false);
	input_bluepara_widthAbsolute.addEventListener('change', event_bluepara_widthAbsolute, false);
	event_bluepara_heightAbsolute = function(e) {
		stopE(e);
		current_bluepara_height = parseFloat(input_bluepara_heightAbsolute.value);
		bluepara.set({
			height: current_bluepara_height,
		});
	};
	input_bluepara_heightAbsolute.addEventListener('input', event_bluepara_heightAbsolute, false);
	input_bluepara_heightAbsolute.addEventListener('change', event_bluepara_heightAbsolute, false);
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

	//animation object
	scrawl.newAnimation({
		fn: function() {

			scrawl.render();

			//report on the current values of each controller
			status.innerHTML = '<b>Blue stack settings - scale:</b> ' + current_bluestack_scale +
				'<br /><b>Blue paragraph settings - startX:</b> ' + current_blueparastart_x +
				'; <b>startY:</b> ' + current_blueparastart_y +
				'; <b>handleX:</b> ' + current_blueparahandle_x +
				'; <b>handleY:</b> ' + current_blueparahandle_y +
				'; <b>width:</b> ' + current_bluepara_width +
				'; <b>height:</b> ' + current_bluepara_height;

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
	modules: ['stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
