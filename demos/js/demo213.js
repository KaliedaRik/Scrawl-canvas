var mycode = function() {
	'use strict';

	//shorthand variables for manipulating each stack and element
	var bluestack = scrawl.stack.mainstack,
		bluepara = scrawl.element.maincopytext,
		redstack = scrawl.stack.substack,
		redpara = scrawl.element.subcopytext,

		//grabbing the status div
		status = document.getElementById('status'),
		setStatus,

		//functions
		events,
		stopE;

	//set the initial imput values
	document.getElementById('bluestack_scale').value = 1;
	document.getElementById('redstack_scale').value = 1;
	document.getElementById('redstackstart_xPercent').value = 0;
	document.getElementById('redstackstart_yPercent').value = 0;
	document.getElementById('redstackstart_xAbsolute').value = 0;
	document.getElementById('redstackstart_yAbsolute').value = 0;
	document.getElementById('redstackstart_xString').options.selectedIndex = 0;
	document.getElementById('redstackstart_yString').options.selectedIndex = 0;
	document.getElementById('redstackhandle_xPercent').value = 0;
	document.getElementById('redstackhandle_yPercent').value = 0;
	document.getElementById('redstackhandle_xAbsolute').value = 0;
	document.getElementById('redstackhandle_yAbsolute').value = 0;
	document.getElementById('redstackhandle_xString').options.selectedIndex = 0;
	document.getElementById('redstackhandle_yString').options.selectedIndex = 0;
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
	document.getElementById('redparastart_xPercent').value = 0;
	document.getElementById('redparastart_yPercent').value = 0;
	document.getElementById('redparastart_xAbsolute').value = 0;
	document.getElementById('redparastart_yAbsolute').value = 0;
	document.getElementById('redparastart_xString').options.selectedIndex = 1;
	document.getElementById('redparastart_yString').options.selectedIndex = 1;
	document.getElementById('redparahandle_xPercent').value = 0;
	document.getElementById('redparahandle_yPercent').value = 0;
	document.getElementById('redparahandle_xAbsolute').value = 0;
	document.getElementById('redparahandle_yAbsolute').value = 0;
	document.getElementById('redparahandle_xString').options.selectedIndex = 1;
	document.getElementById('redparahandle_yString').options.selectedIndex = 1;

	//set stacks and elements to initial values
	bluestack.set({
		width: 600,
		height: 600,
		borderColor: 'blue'
	});
	bluepara.set({
		width: '50%',
		borderColor: 'lightblue',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center'
	});
	redstack.set({
		width: '50%',
		height: '50%',
		position: 'absolute',
		borderColor: 'red',
		boxSizing: 'content-box'
	});
	redpara.set({
		width: '50%',
		borderColor: 'pink',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center'
	});

	//setup circles to mark the start (rotation/reflection) points for each stack and element
	scrawl.makeWheel({
		name: 'substackWheel',
		pivot: 'substack',
		fillStyle: 'red',
		radius: 10,
		group: scrawl.pad[bluestack.canvas].base,
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

	setStatus = function() {
		status.innerHTML = '<b>Blue stack settings - scale:</b> ' + bluestack.scale +
			'<br /><b>Blue paragraph settings - startX:</b> ' + bluepara.start.x +
			'; <b>startY:</b> ' + bluepara.start.y +
			'; <b>handleX:</b> ' + bluepara.handle.x +
			'; <b>handleY:</b> ' + bluepara.handle.y +
			'<br /><b>Red stack settings - scale:</b> ' + redstack.scale +
			'; <b>startX:</b> ' + redstack.start.x +
			'; <b>startY:</b> ' + redstack.start.y +
			'; <b>handleX:</b> ' + redstack.handle.x +
			'; <b>handleY:</b> ' + redstack.handle.y +
			'<br /><b>Pink paragraph settings - startX:</b> ' + redpara.start.x +
			'; <b>startY:</b> ' + redpara.start.y +
			'; <b>handleX:</b> ' + redpara.handle.x +
			'; <b>handleY:</b> ' + redpara.handle.y;
	};

	setStatus();

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	events = function(e) {
		var itemsBlueStack = {},
			itemsBluePara = {},
			itemsRedStack = {},
			itemsRedPara = {};
		stopE(e);
		switch (e.target.id) {
			case 'bluestack_scale':
				itemsBlueStack.scale = parseFloat(e.target.value);
				break;
			case 'redstack_scale':
				itemsRedStack.scale = parseFloat(e.target.value);
				break;
			case 'redstackstart_xPercent':
				itemsRedStack.startX = e.target.value + '%';
				break;
			case 'redstackstart_yPercent':
				itemsRedStack.startY = e.target.value + '%';
				break;
			case 'redstackstart_xAbsolute':
				itemsRedStack.startX = Math.round(e.target.value);
				break;
			case 'redstackstart_yAbsolute':
				itemsRedStack.startY = Math.round(e.target.value);
				break;
			case 'redstackstart_xString':
				itemsRedStack.startX = e.target.value;
				break;
			case 'redstackstart_yString':
				itemsRedStack.startY = e.target.value;
				break;
			case 'redstackhandle_xPercent':
				itemsRedStack.handleX = e.target.value + '%';
				break;
			case 'redstackhandle_yPercent':
				itemsRedStack.handleY = e.target.value + '%';
				break;
			case 'redstackhandle_xAbsolute':
				itemsRedStack.handleX = Math.round(e.target.value);
				break;
			case 'redstackhandle_yAbsolute':
				itemsRedStack.handleY = Math.round(e.target.value);
				break;
			case 'redstackhandle_xString':
				itemsRedStack.handleX = e.target.value;
				break;
			case 'redstackhandle_yString':
				itemsRedStack.handleY = e.target.value;
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
			case 'redparastart_xPercent':
				itemsRedPara.startX = e.target.value + '%';
				break;
			case 'redparastart_yPercent':
				itemsRedPara.startY = e.target.value + '%';
				break;
			case 'redparastart_xAbsolute':
				itemsRedPara.startX = Math.round(e.target.value);
				break;
			case 'redparastart_yAbsolute':
				itemsRedPara.startY = Math.round(e.target.value);
				break;
			case 'redparastart_xString':
				itemsRedPara.startX = e.target.value;
				break;
			case 'redparastart_yString':
				itemsRedPara.startY = e.target.value;
				break;
			case 'redparahandle_xPercent':
				itemsRedPara.handleX = e.target.value + '%';
				break;
			case 'redparahandle_yPercent':
				itemsRedPara.handleY = e.target.value + '%';
				break;
			case 'redparahandle_xAbsolute':
				itemsRedPara.handleX = Math.round(e.target.value);
				break;
			case 'redparahandle_yAbsolute':
				itemsRedPara.handleY = Math.round(e.target.value);
				break;
			case 'redparahandle_xString':
				itemsRedPara.handleX = e.target.value;
				break;
			case 'redparahandle_yString':
				itemsRedPara.handleY = e.target.value;
				break;
		}
		bluestack.set(itemsBlueStack);
		bluepara.set(itemsBluePara);
		redstack.set(itemsRedStack);
		redpara.set(itemsRedPara);

		setStatus();
		scrawl.domInit();
		scrawl.render();
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//DOM initialization
	scrawl.domInit();
	scrawl.render();
};

//module loading and initialization function
scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['stacks', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
