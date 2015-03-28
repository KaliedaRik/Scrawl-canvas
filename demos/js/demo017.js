var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var peacock,
		events,
		data,
		stopE;

	//import images; setup variables
	scrawl.getImagesByClass('demo017');

	data = document.getElementById('data');

	//set the initial imput values
	document.getElementById('pasteX_abs').value = '290';
	document.getElementById('pasteY_abs').value = '200';
	document.getElementById('pasteX_rel').value = '50';
	document.getElementById('pasteY_rel').value = '50';
	document.getElementById('pasteWidth_abs').value = '290';
	document.getElementById('pasteHeight_abs').value = '200';
	document.getElementById('pasteWidth_rel').value = '50';
	document.getElementById('pasteHeight_rel').value = '50';
	document.getElementById('handleX_abs').value = '145';
	document.getElementById('handleY_abs').value = '100';
	document.getElementById('handleX_rel').value = '50';
	document.getElementById('handleY_rel').value = '50';
	document.getElementById('handleX_str').value = 'center';
	document.getElementById('handleY_str').value = 'center';
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

	//build entity
	peacock = scrawl.makePicture({
		pasteX: '50%',
		pasteY: '50%',
		pasteWidth: '50%',
		pasteHeight: '50%',
		handleX: 'center',
		handleY: 'center',
		copyX: 0,
		copyY: 0,
		copyWidth: '100%',
		copyHeight: '100%',
		strokeStyle: 'red',
		lineWidth: 2,
		method: 'fillDraw',
		source: 'peacock',
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		var items = {},
			temp;
		stopE(e);
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
			peacock.set(items);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			data.innerHTML = '<br />pasteX: ' + peacock.start.x +
				', pasteY: ' + peacock.start.y +
				', pasteWidth: ' + peacock.width +
				', pasteHeight: ' + peacock.height +
				'<br />copyX: ' + peacock.copy.x +
				', copyY: ' + peacock.copy.y +
				', copyWidth: ' + peacock.copyWidth +
				', copyHeight: ' + peacock.copyHeight +
				'<br />handleX: ' + peacock.handle.x +
				', handleY: ' + peacock.handle.y +
				', scale: ' + peacock.scale +
				', roll: ' + peacock.roll +
				', flipUpend: ' + peacock.flipUpend +
				'; flipReverse: ' + peacock.flipReverse;

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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
