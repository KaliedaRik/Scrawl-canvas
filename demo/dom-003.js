import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement,
	stopE, events;

stack.set({
	perspectiveZ: 1200
});

element.set({
	startX: 250,
	startY: 250,
	handleX: 125,
	handleY: 125,
	width: 250,
	height: 250,
	roll: 10,
	pitch: 20,
	yaw: 30
});

document.querySelector('#dims_widthPercent').value = 50;
document.querySelector('#dims_heightPercent').value = 50;
document.querySelector('#dims_widthAbsolute').value = 250;
document.querySelector('#dims_heightAbsolute').value = 250;
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 250;
document.querySelector('#start_yAbsolute').value = 250;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#handle_xAbsolute').value = 125;
document.querySelector('#handle_yAbsolute').value = 125;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

events = (e) => {

	let items = {};

	stopE(e);

	switch (e.target.id) {

		case 'start_xPercent':
			items.startX = e.target.value + '%';
			break;

		case 'start_yPercent':
			items.startY = e.target.value + '%';
			break;

		case 'start_xAbsolute':
			items.startX = Math.round(e.target.value);
			break;

		case 'start_yAbsolute':
			items.startY = Math.round(e.target.value);
			break;

		case 'start_xString':
			items.startX = e.target.value;
			break;

		case 'start_yString':
			items.startY = e.target.value;
			break;

		case 'dims_widthPercent':
			items.width = e.target.value + '%';
			break;

		case 'dims_heightPercent':
			items.height = e.target.value + '%';
			break;

		case 'dims_widthAbsolute':
			items.width = Math.round(e.target.value);
			break;

		case 'dims_heightAbsolute':
			items.height = Math.round(e.target.value);
			break;

		case 'handle_xPercent':
			items.handleX = e.target.value + '%';
			break;

		case 'handle_yPercent':
			items.handleY = e.target.value + '%';
			break;

		case 'handle_xAbsolute':
			items.handleX = Math.round(e.target.value);
			break;

		case 'handle_yAbsolute':
			items.handleY = Math.round(e.target.value);
			break;

		case 'handle_xString':
			items.handleX = e.target.value;
			break;

		case 'handle_yString':
			items.handleY = e.target.value;
			break;

		case 'roll':
			items.roll = parseFloat(e.target.value);
			break;

		case 'pitch':
			items.pitch = parseFloat(e.target.value);
			break;

		case 'yaw':
			items.yaw = parseFloat(e.target.value);
			break;

		case 'scale':
			items.scale = parseFloat(e.target.value);
			break;
	}

	element.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

scrawl.makeAnimation({

	name: 'testD003Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			element.set({
				lockTo: (stack.here.active) ? 'mouse' : 'start'
			});

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}<br />
				lock to: ${element.lockXTo}; width: ${element.width}; height: ${element.height}<br />
				startX: ${element.start.x}; startY: ${element.start.y}; handleX: ${element.handle.x}; handleY: ${element.handle.y}<br />
				scale: ${element.scale}; roll: ${element.roll}&deg;; pitch: ${element.pitch}&deg;; yaw: ${element.yaw}&deg;`;

				resolve(true);
			})
			.catch((err) => {

				testTicker = Date.now();
				testMessage.innerHTML = (err.substring) ? err : JSON.stringify(err);

				resolve(false);
			});
		});
	}
});
