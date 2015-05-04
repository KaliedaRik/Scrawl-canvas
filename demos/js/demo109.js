var mycode = function() {
	'use strict';

	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var block,
		wheel,
		phrase,
		image,
		shape,
		path,
		events;

	document.getElementById('block_startX').value = 15;
	document.getElementById('block_startY').value = 20;
	document.getElementById('block_width').value = 10;
	document.getElementById('block_height').value = 10;
	document.getElementById('wheel_startX').value = 50;
	document.getElementById('wheel_startY').value = 20;
	document.getElementById('phrase_startX').value = 80;
	document.getElementById('phrase_startY').value = 40;
	document.getElementById('shape_startX').value = 10;
	document.getElementById('shape_startY').value = 70;
	document.getElementById('path_startX').value = 85;
	document.getElementById('path_startY').value = 80;
	document.getElementById('image_width').value = 20;
	document.getElementById('image_height').value = 20;
	document.getElementById('image_startX').value = 45;
	document.getElementById('image_startY').value = 70;

	//code here
	scrawl.getImagesByClass('demo109');

	block = scrawl.makeBlock({
		name: 'myBlock',
		startX: '15%',
		startY: '20%',
		width: '10%',
		height: '10%',
		method: 'fillDraw',
		fillStyle: 'lightblue',
		strokeStyle: 'green',
		lineWidth: 3,
		handleX: 'center',
		handleY: 'center',
	});
	image = scrawl.makePicture({
		name: 'myImage',
		startX: '45%',
		startY: '70%',
		source: 'parrot',
		width: '20%',
		height: '20%',
		handleX: 'center',
		handleY: 'center',
	});
	wheel = scrawl.makeWheel({
		name: 'myWheel',
		startX: '50%',
		startY: '20%',
		radius: 40,
		method: 'fillDraw',
		fillStyle: 'yellow',
		strokeStyle: 'brown',
		lineWidth: 3,
	});
	phrase = scrawl.makePhrase({
		name: 'myPhrase',
		text: 'Hello world!\nHow are you today?',
		font: '20pt Arial',
		startX: '80%',
		startY: '40%',
		handleX: 'center',
		handleY: 'center',
		textAlign: 'center',
		fillStyle: 'orange',
	});
	shape = scrawl.makeLine({
		name: 'myShape',
		startX: '10%',
		startY: '70%',
		endX: '15%',
		endY: '90%',
		shape: true,
		strokeStyle: 'pink',
		lineWidth: 6,
		lineCap: 'round',
	});
	path = scrawl.makeEllipse({
		name: 'myPath',
		startX: '85%',
		startY: '80%',
		radiusX: 25,
		radiusY: 45,
		roll: 45,
		strokeStyle: 'green',
		lineWidth: 3,
	});

	scrawl.makeWheel({
		pivot: 'myBlock',
		fillStyle: 'red',
		radius: 4,
	}).clone({
		pivot: 'myWheel',
	}).clone({
		pivot: 'myPhrase',
	}).clone({
		pivot: 'myShape',
	}).clone({
		pivot: 'myPath',
	}).clone({
		pivot: 'myImage',
	});

	//flicker on Chrome is particularly bad for this demo - turn entity sorting off
	scrawl.group.mycanvas_base.entitySort = false;

	//event listeners
	events = function(e) {
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
		switch (e.target.id) {
			case 'block_startX':
				block.set({
					startX: e.target.value + '%'
				});
				break;
			case 'block_startY':
				block.set({
					startY: e.target.value + '%'
				});
				break;
			case 'block_width':
				block.set({
					width: e.target.value + '%'
				});
				break;
			case 'block_height':
				block.set({
					height: e.target.value + '%'
				});
				break;
			case 'wheel_startX':
				wheel.set({
					startX: e.target.value + '%'
				});
				break;
			case 'wheel_startY':
				wheel.set({
					startY: e.target.value + '%'
				});
				break;
			case 'phrase_startX':
				phrase.set({
					startX: e.target.value + '%'
				});
				break;
			case 'phrase_startY':
				phrase.set({
					startY: e.target.value + '%'
				});
				break;
			case 'shape_startX':
				shape.set({
					startX: e.target.value + '%'
				});
				break;
			case 'shape_startY':
				shape.set({
					startY: e.target.value + '%'
				});
				break;
			case 'path_startX':
				path.set({
					startX: e.target.value + '%'
				});
				break;
			case 'path_startY':
				path.set({
					startY: e.target.value + '%'
				});
				break;
			case 'image_startX':
				image.set({
					startX: e.target.value + '%'
				});
				break;
			case 'image_startY':
				image.set({
					startY: e.target.value + '%'
				});
				break;
			case 'image_width':
				image.set({
					width: e.target.value + '%'
				});
				break;
			case 'image_height':
				image.set({
					height: e.target.value + '%'
				});
				break;
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['block', 'wheel', 'images', 'phrase', 'shape', 'path', 'factories', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
