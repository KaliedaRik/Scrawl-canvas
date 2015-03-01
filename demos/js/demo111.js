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
		events,
		data = document.getElementById('data'),
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
	scrawl.makePicture({
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
	document.getElementById('pasteX_abs').value = '0';
	document.getElementById('pasteY_abs').value = '0';
	document.getElementById('pasteX_rel').value = '0';
	document.getElementById('pasteY_rel').value = '0';
	document.getElementById('pasteWidth_abs').value = '580';
	document.getElementById('pasteHeight_abs').value = '400';
	document.getElementById('pasteWidth_rel').value = '100';
	document.getElementById('pasteHeight_rel').value = '100';
	document.getElementById('handleX_abs').value = '0';
	document.getElementById('handleY_abs').value = '0';
	document.getElementById('handleX_rel').value = '0';
	document.getElementById('handleY_rel').value = '0';
	document.getElementById('handleX_str').value = 'left';
	document.getElementById('handleY_str').value = 'top';
	document.getElementById('copyX_abs').value = '0';
	document.getElementById('copyY_abs').value = '0';
	document.getElementById('copyX_rel').value = '0';
	document.getElementById('copyY_rel').value = '0';
	document.getElementById('copyWidth_abs').value = '580';
	document.getElementById('copyHeight_abs').value = '400';
	document.getElementById('copyWidth_rel').value = '100';
	document.getElementById('copyHeight_rel').value = '100';
	document.getElementById('scale').value = '1';
	document.getElementById('roll').value = '0';
	document.getElementById('flip').value = 'normal';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		var items = {},
			temp;
		stop(e);
		console.log(e.target.id, e.target.value);
		switch (e.target.id) {
			case 'pasteX_abs':
				items.pasteX = Math.round(e.target.value);
				break;
			case 'pasteY_abs':
				items.pasteY = Math.round(e.target.value);
				break;
			case 'pasteX_rel':
				items.pasteX = e.target.value + '%';
				break;
			case 'pasteY_rel':
				items.pasteY = e.target.value + '%';
				break;
			case 'pasteWidth_abs':
				items.pasteWidth = Math.round(e.target.value);
				break;
			case 'pasteHeight_abs':
				items.pasteHeight = Math.round(e.target.value);
				break;
			case 'pasteWidth_rel':
				items.pasteWidth = e.target.value + '%';
				break;
			case 'pasteHeight_rel':
				items.pasteHeight = e.target.value + '%';
				break;
			case 'handleX_abs':
				items.handleX = Math.round(e.target.value);
				break;
			case 'handleY_abs':
				items.handleY = Math.round(e.target.value);
				break;
			case 'handleX_rel':
				items.handleX = e.target.value + '%';
				break;
			case 'handleY_rel':
				items.handleY = e.target.value + '%';
				break;
			case 'handleX_str':
				items.handleX = e.target.value;
				break;
			case 'handleY_str':
				items.handleY = e.target.value;
				break;
			case 'copyX_abs':
				items.copyX = Math.round(e.target.value);
				break;
			case 'copyY_abs':
				items.copyY = Math.round(e.target.value);
				break;
			case 'copyX_rel':
				items.copyX = e.target.value + '%';
				break;
			case 'copyY_rel':
				items.copyY = e.target.value + '%';
				break;
			case 'copyWidth_abs':
				items.copyWidth = Math.round(e.target.value);
				break;
			case 'copyHeight_abs':
				items.copyHeight = Math.round(e.target.value);
				break;
			case 'copyWidth_rel':
				items.copyWidth = e.target.value + '%';
				break;
			case 'copyHeight_rel':
				items.copyHeight = e.target.value + '%';
				break;
			case 'scale':
				items.scale = parseFloat(e.target.value);
				break;
			case 'roll':
				items.roll = Math.round(e.target.value);
				break;
			case 'flip':
				temp = e.target.value;
				items.flipReverse = scrawl.contains(['reverse', 'both'], temp) ? true : false;
				items.flipUpend = scrawl.contains(['upend', 'both'], temp) ? true : false;
				break;
			default:
				items = false;
		}
		if (items) {
			myCell.set(items);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			data.innerHTML = 'start.x: ' + myCell.start.x +
				'; start.y: ' + myCell.start.y +
				'; handle.x: ' + myCell.handle.x +
				'; handle.y: ' + myCell.handle.y +
				'; copy.x: ' + myCell.copy.x +
				'; copy.y: ' + myCell.copy.y +
				'<br />pasteWidth: ' + myCell.pasteWidth +
				'; pasteHeight: ' + myCell.pasteHeight +
				'; copyWidth: ' + myCell.copyWidth +
				'; copyHeight: ' + myCell.copyHeight +
				'; scale: ' + myCell.scale;

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
