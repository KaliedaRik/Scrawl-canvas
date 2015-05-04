var mycode = function() {
	'use strict';

	//shorthand variables for manipulating each stack and element
	var bluestack = scrawl.stack.mainstack,
		bluepara = scrawl.element.element1,
		redpara = scrawl.element.element2,
		greenpara = scrawl.element.element3,
		group = scrawl.group.mainstack,

		//functions
		events,
		stopE;

	//set stacks and elements to initial values
	bluestack.set({
		width: 600,
		height: 600,
		border: '1px solid blue'
	});
	bluepara.set({
		width: '50%',
		height: '0%',
		border: '1px solid lightblue',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center'
	});
	redpara.set({
		height: 0,
		border: '1px solid pink',
		pivot: 'element1',
		lockTo: 'bottom'
	});
	greenpara.set({
		height: 0,
		border: '1px solid green',
		pivot: 'element2',
		lockTo: 'bottom'
	});

	//initial values for the input controllers
	document.getElementById('bluestack_scale').value = 1;
	document.getElementById('bluepara_widthPercent').value = 50;
	document.getElementById('bluepara_heightPercent').value = 0;
	document.getElementById('bluepara_widthAbsolute').value = 300;
	document.getElementById('bluepara_heightAbsolute').value = 300;
	document.getElementById('blueparastart_xPercent').value = 0;
	document.getElementById('blueparastart_yPercent').value = 0;
	document.getElementById('blueparastart_xAbsolute').value = 0;
	document.getElementById('blueparastart_yAbsolute').value = 0;
	document.getElementById('blueparastart_xString').options.selectedIndex = 1;
	document.getElementById('blueparastart_yString').options.selectedIndex = 1;
	document.getElementById('blueparahandle_xPercent').value = 0;
	document.getElementById('blueparahandle_yPercent').value = 0;
	document.getElementById('blueparahandle_xAbsolute').value = 0;
	document.getElementById('blueparahandle_yAbsolute').value = 0;
	document.getElementById('blueparahandle_xString').options.selectedIndex = 1;
	document.getElementById('blueparahandle_yString').options.selectedIndex = 1;
	document.getElementById('borderWidth').value = 1;
	document.getElementById('padding').value = 0;
	document.getElementById('boxSizing').options.selectedIndex = 0;
	document.getElementById('borderStyle').options.selectedIndex = 0;
	document.getElementById('redpara_lockto').options.selectedIndex = 3;
	document.getElementById('greenpara_lockto').options.selectedIndex = 3;
	document.getElementById('equalwidth').options.selectedIndex = 0;
	document.getElementById('equalheight').options.selectedIndex = 0;

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	events = function(e) {
		var itemsBlueStack = {},
			itemsBluePara = {},
			itemsGreenPara = {},
			itemsRedPara = {},
			itemsGroup = {};
		stopE(e);
		switch (e.target.id) {
			case 'bluestack_scale':
				itemsBlueStack.scale = parseFloat(e.target.value);
				break;
			case 'borderWidth':
				itemsBluePara.borderWidth = e.target.value + 'px';
				break;
			case 'padding':
				itemsBluePara.padding = e.target.value + 'px';
				break;
			case 'boxSizing':
				itemsBluePara.boxSizing = e.target.value;
				break;
			case 'borderStyle':
				itemsBluePara.borderStyle = e.target.value;
				break;
			case 'blueparastart_xPercent':
				itemsBluePara.startX = e.target.value + '%';
				break;
			case 'blueparastart_yPercent':
				itemsBluePara.startY = e.target.value + '%';
				break;
			case 'blueparastart_xAbsolute':
				itemsBluePara.startX = Math.round(e.target.value);
				break;
			case 'blueparastart_yAbsolute':
				itemsBluePara.startY = Math.round(e.target.value);
				break;
			case 'blueparastart_xString':
				itemsBluePara.startX = e.target.value;
				break;
			case 'blueparastart_yString':
				itemsBluePara.startY = e.target.value;
				break;
			case 'bluepara_widthPercent':
				itemsBluePara.width = e.target.value + '%';
				break;
			case 'bluepara_heightPercent':
				itemsBluePara.height = e.target.value + '%';
				break;
			case 'bluepara_widthAbsolute':
				itemsBluePara.width = Math.round(e.target.value);
				break;
			case 'bluepara_heightAbsolute':
				itemsBluePara.height = Math.round(e.target.value);
				break;
			case 'blueparahandle_xPercent':
				itemsBluePara.handleX = e.target.value + '%';
				break;
			case 'blueparahandle_yPercent':
				itemsBluePara.handleY = e.target.value + '%';
				break;
			case 'blueparahandle_xAbsolute':
				itemsBluePara.handleX = Math.round(e.target.value);
				break;
			case 'blueparahandle_yAbsolute':
				itemsBluePara.handleY = Math.round(e.target.value);
				break;
			case 'blueparahandle_xString':
				itemsBluePara.handleX = e.target.value;
				break;
			case 'blueparahandle_yString':
				itemsBluePara.handleY = e.target.value;
				break;
			case 'redpara_lockto':
				itemsRedPara.lockTo = e.target.value;
				break;
			case 'greenpara_lockto':
				itemsGreenPara.lockTo = e.target.value;
				break;
			case 'equalwidth':
				itemsGroup.equalWidth = e.target.value;
				break;
			case 'equalheight':
				itemsGroup.equalHeight = e.target.value;
				break;
		}
		bluestack.set(itemsBlueStack);
		bluepara.set(itemsBluePara);
		greenpara.set(itemsGreenPara);
		redpara.set(itemsRedPara);
		group.set(itemsGroup);

		scrawl.domInit();
		scrawl.render();
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//DOM initialization
	scrawl.domInit();
	scrawl.render();

};

//module loading and initialization function
scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
