var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var shape,
		shapeData,
		path,
		pathData,
		buildEntitys,
		events,

		data = document.getElementById('data'),

		current_radius = 150,
		current_angle = 60,
		current_CX1 = 0,
		current_CY1 = 0,
		current_CX2 = 0,
		current_CY2 = 0,
		current_lineType = 'l',

		// input_radius = document.getElementById('radius'),
		// input_angle = document.getElementById('angle'),
		// input_CX1 = document.getElementById('CX1'),
		// input_CY1 = document.getElementById('CY1'),
		// input_CX2 = document.getElementById('CX2'),
		// input_CY2 = document.getElementById('CY2'),
		// input_lineType = document.getElementById('lineType'),

		// event_radius,
		// event_angle,
		// event_CX1,
		// event_CY1,
		// event_CX2,
		// event_CY2,
		// event_lineType,

		stopE;

	// input_radius.value = 150;
	// input_angle.value = 60;
	// input_CX1.value = 0;
	// input_CX2.value = 0;
	// input_CY1.value = 0;
	// input_CY2.value = 0;
	// input_lineType.value = 'l';
	document.getElementById('radius').value = '150';
	document.getElementById('angle').value = '60';
	document.getElementById('CX1').value = '0';
	document.getElementById('CY1').value = '0';
	document.getElementById('CX2').value = '0';
	document.getElementById('CY2').value = '0';
	document.getElementById('lineType').value = 'l';

	//define gradient
	scrawl.makeRadialGradient({
		name: 'gradient',
		startX: '50%',
		endX: '50%',
		startY: '50%',
		endY: '50%',
		shift: 0.001,
		autoUpdate: true,
		lockTo: true,
		color: [{
			color: 'red',
			stop: 0
        }, {
			color: 'green',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'purple',
			stop: 0.6
        }, {
			color: 'silver',
			stop: 0.8
        }, {
			color: 'red',
			stop: 0.999999
        }, ],
	});

	//define entitys
	buildEntitys = function() {
		scrawl.deleteEntity('myshape', 'mypath');
		shape = scrawl.makeRegularShape({
			name: 'myshape',
			startX: 200,
			startY: 220,
			winding: 'evenodd',
			fillStyle: 'gradient',
			lineWidth: 2,
			scaleOutline: false,
			method: 'fillDraw',
			radius: current_radius,
			angle: current_angle,
			startControlX: current_CX1,
			startControlY: current_CY1,
			endControlX: current_CX2,
			endControlY: current_CY2,
			lineType: current_lineType,
			shape: true,
		});
		path = scrawl.makeRegularShape({
			name: 'mypath',
			startX: 550,
			startY: 220,
			winding: 'evenodd',
			fillStyle: 'gradient',
			lineWidth: 2,
			scaleOutline: false,
			method: 'fillDraw',
			radius: current_radius,
			angle: current_angle,
			startControlX: current_CX1,
			startControlY: current_CY1,
			endControlX: current_CX2,
			endControlY: current_CY2,
			lineType: current_lineType,
			shape: false,
		});
		data.innerHTML = '<br />Shape: scrawl.makeRegularShape({radius: ' + current_radius + ', angle: ' + current_angle + ', startControlX: ' + current_CX1 + ', startControlY: ' + current_CY1 + ', endControlX: ' + current_CX2 + ', endControlY: ' + current_CY2 + ', lineType: "' + current_lineType + '", shape: true});<br />Path: scrawl.makeRegularShape({radius: ' + current_radius + ', angle: ' + current_angle + ', startControlX: ' + current_CX1 + ', startControlY: ' + current_CY1 + ', endControlX: ' + current_CX2 + ', endControlY: ' + current_CY2 + ', lineType: "' + current_lineType + '", shape: false});';
	};
	scrawl.makePhrase({
		font: '20pt Arial, sans-serif',
		text: 'Path Entity',
		handleX: 'center',
		handleY: 200,
		pivot: 'mypath',
	}).clone({
		text: 'Shape Entity',
		pivot: 'myshape',
	});

	buildEntitys();

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		var item = false;
		stopE(e);
		switch (e.target.id) {
			case 'lineType':
				current_lineType = e.target.value;
				item = true;
				break;
			case 'radius':
				current_radius = Math.round(e.target.value);
				item = true;
				break;
			case 'angle':
				current_angle = Math.round(e.target.value);
				item = true;
				break;
			case 'CX1':
				current_CX1 = Math.round(e.target.value);
				item = true;
				break;
			case 'CX2':
				current_CX2 = Math.round(e.target.value);
				item = true;
				break;
			case 'CY1':
				current_CY1 = Math.round(e.target.value);
				item = true;
				break;
			case 'CY2':
				current_CY2 = Math.round(e.target.value);
				item = true;
				break;
		}
		if (item) {
			buildEntitys();
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['path', 'shape', 'animation', 'factories', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
