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
		events,
		stopE;

	document.getElementById('cellblock_startX_abs').value = 150;
	document.getElementById('cellblock_startY_abs').value = 200;
	document.getElementById('cellblock_handleX_abs').value = 0;
	document.getElementById('cellblock_handleY_abs').value = 0;
	document.getElementById('cellblock_width_abs').value = 100;
	document.getElementById('cellblock_height_abs').value = 100;
	document.getElementById('cellblock_roll').value = 0;
	document.getElementById('cellblock_scale').value = 1;
	document.getElementById('cellblock_startX_rel').value = 25;
	document.getElementById('cellblock_startY_rel').value = 50;
	document.getElementById('cellblock_handleX_rel').value = 0;
	document.getElementById('cellblock_handleY_rel').value = 0;
	document.getElementById('cellblock_width_rel').value = 20;
	document.getElementById('cellblock_height_rel').value = 20;
	document.getElementById('cellgrad_startX_abs').value = 0;
	document.getElementById('cellgrad_startY_abs').value = 0;
	document.getElementById('cellgrad_endX_abs').value = 600;
	document.getElementById('cellgrad_endY_abs').value = 400;
	document.getElementById('cellgrad_startX_rel').value = 0;
	document.getElementById('cellgrad_startY_rel').value = 100;
	document.getElementById('cellgrad_endX_rel').value = 0;
	document.getElementById('cellgrad_endY_rel').value = 0;
	document.getElementById('entityblock_startX_abs').value = 450;
	document.getElementById('entityblock_startY_abs').value = 200;
	document.getElementById('entityblock_handleX_abs').value = 0;
	document.getElementById('entityblock_handleY_abs').value = 0;
	document.getElementById('entityblock_width_abs').value = 100;
	document.getElementById('entityblock_height_abs').value = 100;
	document.getElementById('entityblock_roll').value = 0;
	document.getElementById('entityblock_scale').value = 1;
	document.getElementById('entityblock_startX_rel').value = 75;
	document.getElementById('entityblock_startY_rel').value = 50;
	document.getElementById('entityblock_handleX_rel').value = 0;
	document.getElementById('entityblock_handleY_rel').value = 0;
	document.getElementById('entityblock_width_rel').value = 20;
	document.getElementById('entityblock_height_rel').value = 20;
	document.getElementById('entitygrad_startX_abs').value = 0;
	document.getElementById('entitygrad_startY_abs').value = 0;
	document.getElementById('entitygrad_endX_abs').value = 100;
	document.getElementById('entitygrad_endY_abs').value = 100;
	document.getElementById('entitygrad_startX_rel').value = 0;
	document.getElementById('entitygrad_startY_rel').value = 100;
	document.getElementById('entitygrad_endX_rel').value = 0;
	document.getElementById('entitygrad_endY_rel').value = 0;
	document.getElementById('flip').value = 'normal';

	//code here
	cellGrad = scrawl.makeGradient({
		name: 'g1',
		lockTo: false,
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
	entityGrad = scrawl.makeGradient({
		name: 'g2',
		lockTo: true,
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

	cellBox = scrawl.makeBlock({
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
	entityBox = scrawl.makeBlock({
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
	scrawl.makePhrase({
		pivot: 'box1',
		text: 'Cell gradient',
		handleX: -20,
		handleY: -20,
	}).clone({
		pivot: 'box2',
		text: 'Entity gradient',
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	events = function(e) {
		var cellBlockItems = {},
			entityBlockItems = {},
			cellGradItems = {},
			entityGradItems = {},
			temp;
		stopE(e);
		switch (e.target.id) {
			case 'cellblock_startX_abs':
				cellBlockItems.startX = Math.round(e.target.value);
				break;
			case 'cellblock_startY_abs':
				cellBlockItems.startY = Math.round(e.target.value);
				break;
			case 'cellblock_handleX_abs':
				cellBlockItems.handleX = Math.round(e.target.value);
				break;
			case 'cellblock_handleY_abs':
				cellBlockItems.handleY = Math.round(e.target.value);
				break;
			case 'cellblock_width_abs':
				cellBlockItems.width = Math.round(e.target.value);
				break;
			case 'cellblock_height_abs':
				cellBlockItems.height = Math.round(e.target.value);
				break;
			case 'cellgrad_startX_abs':
				cellGradItems.startX = Math.round(e.target.value);
				break;
			case 'cellgrad_startY_abs':
				cellGradItems.startY = Math.round(e.target.value);
				break;
			case 'cellgrad_endX_abs':
				cellGradItems.endX = Math.round(e.target.value);
				break;
			case 'cellgrad_endY_abs':
				cellGradItems.endY = Math.round(e.target.value);
				break;
			case 'entityblock_startX_abs':
				entityBlockItems.startX = Math.round(e.target.value);
				break;
			case 'entityblock_startY_abs':
				entityBlockItems.startY = Math.round(e.target.value);
				break;
			case 'entityblock_handleX_abs':
				entityBlockItems.handleX = Math.round(e.target.value);
				break;
			case 'entityblock_handleY_abs':
				entityBlockItems.handleY = Math.round(e.target.value);
				break;
			case 'entityblock_width_abs':
				entityBlockItems.width = Math.round(e.target.value);
				break;
			case 'entityblock_height_abs':
				entityBlockItems.height = Math.round(e.target.value);
				break;
			case 'entitygrad_startX_abs':
				entityGradItems.startX = Math.round(e.target.value);
				break;
			case 'entitygrad_startY_abs':
				entityGradItems.startY = Math.round(e.target.value);
				break;
			case 'entitygrad_endX_abs':
				entityGradItems.endX = Math.round(e.target.value);
				break;
			case 'entitygrad_endY_abs':
				entityGradItems.endY = Math.round(e.target.value);
				break;
			case 'cellblock_startX_rel':
				cellBlockItems.startX = e.target.value + '%';
				break;
			case 'cellblock_startY_rel':
				cellBlockItems.startY = e.target.value + '%';
				break;
			case 'cellblock_handleX_rel':
				cellBlockItems.handleX = e.target.value + '%';
				break;
			case 'cellblock_handleY_rel':
				cellBlockItems.handleY = e.target.value + '%';
				break;
			case 'cellblock_width_rel':
				cellBlockItems.width = e.target.value + '%';
				break;
			case 'cellblock_height_rel':
				cellBlockItems.height = e.target.value + '%';
				break;
			case 'cellgrad_startX_rel':
				cellGradItems.startX = e.target.value + '%';
				break;
			case 'cellgrad_startY_rel':
				cellGradItems.startY = e.target.value + '%';
				break;
			case 'cellgrad_endX_rel':
				cellGradItems.endX = e.target.value + '%';
				break;
			case 'cellgrad_endY_rel':
				cellGradItems.endY = e.target.value + '%';
				break;
			case 'entityblock_startX_rel':
				entityBlockItems.startX = e.target.value + '%';
				break;
			case 'entityblock_startY_rel':
				entityBlockItems.startY = e.target.value + '%';
				break;
			case 'entityblock_handleX_rel':
				entityBlockItems.handleX = e.target.value + '%';
				break;
			case 'entityblock_handleY_rel':
				entityBlockItems.handleY = e.target.value + '%';
				break;
			case 'entityblock_width_rel':
				entityBlockItems.width = e.target.value + '%';
				break;
			case 'entityblock_height_rel':
				entityBlockItems.height = e.target.value + '%';
				break;
			case 'entitygrad_startX_rel':
				entityGradItems.startX = e.target.value + '%';
				break;
			case 'entitygrad_startY_rel':
				entityGradItems.startY = e.target.value + '%';
				break;
			case 'entitygrad_endX_rel':
				entityGradItems.endX = e.target.value + '%';
				break;
			case 'entitygrad_endY_rel':
				entityGradItems.endY = e.target.value + '%';
				break;
			case 'cellblock_scale':
				cellBlockItems.scale = parseFloat(e.target.value);
				break;
			case 'cellblock_roll':
				cellBlockItems.roll = Math.round(e.target.value);
				break;
			case 'entityblock_scale':
				entityBlockItems.scale = parseFloat(e.target.value);
				break;
			case 'entityblock_roll':
				entityBlockItems.roll = Math.round(e.target.value);
				break;
			case 'flip':
				temp = e.target.value;
				cellBlockItems.flipReverse = scrawl.contains(['reverse', 'both'], temp) ? true : false;
				cellBlockItems.flipUpend = scrawl.contains(['upend', 'both'], temp) ? true : false;
				entityBlockItems.flipReverse = scrawl.contains(['reverse', 'both'], temp) ? true : false;
				entityBlockItems.flipUpend = scrawl.contains(['upend', 'both'], temp) ? true : false;
				break;
		}
		if (Object.keys(cellBlockItems).length) {
			cellBox.set(cellBlockItems);
		}
		if (Object.keys(entityBlockItems).length) {
			entityBox.set(entityBlockItems);
		}
		if (Object.keys(cellGradItems).length) {
			cellGrad.set(cellGradItems);
		}
		if (Object.keys(entityGradItems).length) {
			entityGrad.set(entityGradItems);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
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
