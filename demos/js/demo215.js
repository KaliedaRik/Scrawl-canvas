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
		bluepara = scrawl.element.element1,
		redpara = scrawl.element.element2,
		greenpara = scrawl.element.element3,
		paragroup = scrawl.group.mainstack,

		//initial settings for stack and element control values
		current_bluestack_scale = 1,

		current_bluepara_width = '50%',
		current_bluepara_height = '0%',
		current_blueparastart_x = 'center',
		current_blueparastart_y = 'center',
		current_blueparahandle_x = 'center',
		current_blueparahandle_y = 'center',
		current_bluepara_borderWidth = 1,
		current_bluepara_padding = 0,
		current_bluepara_boxSizing = 'content-box',
		current_bluepara_borderStyle = 'solid',

		current_redpara_lockto = 'bottom',
		current_greenpara_lockto = 'bottom',

		current_equalwidth = 0,
		current_equalheight = 0,

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
		input_bluepara_borderWidth = document.getElementById('bluepara_borderWidth'),
		input_bluepara_padding = document.getElementById('bluepara_padding'),
		input_bluepara_boxSizing = document.getElementById('bluepara_boxSizing'),
		input_bluepara_borderStyle = document.getElementById('bluepara_borderStyle'),

		input_redpara_lockto = document.getElementById('redpara_lockto'),
		input_greenpara_lockto = document.getElementById('greenpara_lockto'),

		input_equalwidth = document.getElementById('equalwidth'),
		input_equalheight = document.getElementById('equalheight'),

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
		event_bluepara_borderWidth,
		event_bluepara_padding,
		event_bluepara_boxSizing,
		event_bluepara_borderStyle,

		event_redpara_lockto,
		event_greenpara_lockto,

		event_equalheight,
		event_equalwidth,

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
	redpara.set({
		height: 0,
		border: '1px solid pink',
		pivot: 'element1',
		lockTo: 'bottom',
	});
	greenpara.set({
		height: 0,
		border: '1px solid green',
		pivot: 'element2',
		lockTo: 'bottom',
	});
	//recalculate dimensions - so they display correctly on initial load
	bluestack.set({
		scale: 1,
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
	input_bluepara_borderWidth.value = 1;
	input_bluepara_padding.value = 0;
	input_bluepara_boxSizing.options.selectedIndex = 0;
	input_bluepara_borderStyle.options.selectedIndex = 0;

	input_redpara_lockto.options.selectedIndex = 3;
	input_greenpara_lockto.options.selectedIndex = 3;

	input_equalwidth.options.selectedIndex = 0;
	input_equalheight.options.selectedIndex = 0;

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

	event_bluepara_boxSizing = function(e) {
		stopE(e);
		current_bluepara_boxSizing = input_bluepara_boxSizing.value;
		bluepara.set({
			boxSizing: current_bluepara_boxSizing,
		});
	};
	input_bluepara_boxSizing.addEventListener('change', event_bluepara_boxSizing, false);
	event_bluepara_borderStyle = function(e) {
		stopE(e);
		current_bluepara_borderStyle = input_bluepara_borderStyle.value;
		bluepara.set({
			borderStyle: current_bluepara_borderStyle,
		});
	};
	input_bluepara_borderStyle.addEventListener('change', event_bluepara_borderStyle, false);
	event_bluepara_borderWidth = function(e) {
		stopE(e);
		current_bluepara_borderWidth = input_bluepara_borderWidth.value + 'px';
		bluepara.set({
			borderWidth: current_bluepara_borderWidth,
		});
	};
	input_bluepara_borderWidth.addEventListener('input', event_bluepara_borderWidth, false);
	input_bluepara_borderWidth.addEventListener('change', event_bluepara_borderWidth, false);
	event_bluepara_padding = function(e) {
		stopE(e);
		current_bluepara_padding = input_bluepara_padding.value + 'px';
		bluepara.set({
			padding: current_bluepara_padding,
		});
	};
	input_bluepara_padding.addEventListener('input', event_bluepara_padding, false);
	input_bluepara_padding.addEventListener('change', event_bluepara_padding, false);
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

	event_redpara_lockto = function(e) {
		stopE(e);
		current_redpara_lockto = input_redpara_lockto.value;
		redpara.set({
			lockTo: current_redpara_lockto,
		});
	};
	input_redpara_lockto.addEventListener('change', event_redpara_lockto, false);
	event_greenpara_lockto = function(e) {
		stopE(e);
		current_greenpara_lockto = input_greenpara_lockto.value;
		greenpara.set({
			lockTo: current_greenpara_lockto,
		});
	};
	input_greenpara_lockto.addEventListener('change', event_greenpara_lockto, false);

	event_equalwidth = function(e) {
		stopE(e);
		current_equalwidth = Math.round(input_equalwidth.value);
		paragroup.set({
			equalWidth: (current_equalwidth) ? true : false,
		});
	};
	input_equalwidth.addEventListener('change', event_equalwidth, false);
	event_equalheight = function(e) {
		stopE(e);
		current_equalheight = Math.round(input_equalheight.value);
		paragroup.set({
			equalHeight: (current_equalheight) ? true : false,
		});
	};
	input_equalheight.addEventListener('change', event_equalheight, false);

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//report on the current values of each controller
			status.innerHTML = '<b>Blue stack settings - scale:</b> ' + current_bluestack_scale +
				'<br /><b>Blue paragraph settings - startX:</b> ' + current_blueparastart_x +
				'; <b>startY:</b> ' + current_blueparastart_y +
				'; <b>handleX:</b> ' + current_blueparahandle_x +
				'; <b>handleY:</b> ' + current_blueparahandle_y +
				'; <b>width:</b> ' + current_bluepara_width +
				'; <b>height:</b> ' + current_bluepara_height +
				'; <br /><b>blue localwidth:</b> ' + bluepara.localWidth +
				'; <b>blue localheight:</b> ' + bluepara.localHeight +
				'; <br /><b>red localwidth:</b> ' + redpara.localWidth +
				'; <b>red localheight:</b> ' + redpara.localHeight +
				'; <br /><b>green localwidth:</b> ' + greenpara.localWidth +
				'; <b>green localheight:</b> ' + greenpara.localHeight;

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
