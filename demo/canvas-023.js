import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Create Shape entity
let arrow = scrawl.makeShape({

	name: 'myArrow',

	path: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

	startX: 300,
	startY: 200,
	handleX: '50%',
	handleY: '50%',

	scale: 0.2,
	scaleOutline: false,

	lineWidth: 10,
	lineJoin: 'round',

	fillStyle: 'lightgreen',

	method: 'fill',

	showBoundingBox: true,
	useAsPath: true,
	precision: 2,
});

let myWheel = scrawl.makeWheel({
	fillStyle: 'red',
	radius: 3,
	path: 'myArrow',
	pathPosition: 0,
	lockTo: 'path',

	delta: {
		pathPosition: 0.0008,
	}
})

for (let i = 0.01; i < 1; i += 0.01) {

	let col;

	if (i < 0.2) col = 'red';
	else if (i < 0.4) col = 'orange';
	else if (i < 0.6) col = 'darkgreen';
	else if (i < 0.8) col = 'blue';
	else col = 'purple';

	myWheel.clone({
		pathPosition: i,
		fillStyle: col,
	})
}


// Event listeners
let stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

let events = (e) => {

	let items = {};

	stopE(e);

	switch (e.target.id) {

		case 'start_xPercent':
			items.startX = e.target.value + '%';
			break;

		case 'start_yPercent':
			items.startY = e.target.value + '%';
			break;

		case 'handle_xPercent':
			items.handleX = e.target.value + '%';
			break;

		case 'handle_yPercent':
			items.handleY = e.target.value + '%';
			break;

		case 'start_xAbsolute':
			items.startX = Math.round(e.target.value);
			break;

		case 'start_yAbsolute':
			items.startY = Math.round(e.target.value);
			break;

		case 'handle_xAbsolute':
			items.handleX = Math.round(e.target.value);
			break;

		case 'handle_yAbsolute':
			items.handleY = Math.round(e.target.value);
			break;

		case 'start_xString':
			items.startX = e.target.value;
			break;

		case 'start_yString':
			items.startY = e.target.value;
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

		case 'scale':
			items.scale = parseFloat(e.target.value);
			break;

		case 'upend':
			items.flipUpend = (e.target.value === '1') ? true : false;
			break;

		case 'reverse':
			items.flipReverse = (e.target.value === '1') ? true : false;
			break;
	}

	arrow.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 0.2;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;


// Animation 
scrawl.makeAnimation({

	name: 'testC023Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}<br />
					Shape path length: ${arrow.length}`;

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
