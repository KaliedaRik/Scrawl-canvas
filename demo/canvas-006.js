import scrawl from '../source/scrawl.js'


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	canvas = artefact.mycanvas,
	stopE, events,
	blocky, wheely,
	lockx = 'start',
	locky = 'start';

canvas.set({
	fit: 'fill',
	css: {
		border: '1px solid black'
	}
}).setBase({
	width: 1000,
	height: 1000,
	backgroundColor: 'lightgray'
});

blocky = scrawl.makeBlock({
	name: 'myblock',
	width: 200,
	height: 200,
	startX: 120,
	startY: 120,
	handleX: 'center',
	handleY: 'center',

	lockTo: 'start',

	pivot: 'mywheel',

	fillStyle: 'blue',
	strokeStyle: 'gold',
	lineWidth: 6,
	method: 'fillDraw',
});

wheely = scrawl.makeWheel({
	name: 'mywheel',
	radius: 60,
	startX: 'center',
	startY: 'center',
	handleX: 350,
	order: 1,

	delta: {
		roll: 0.6
	},

	fillStyle: 'red',
	method: 'fillDraw',
});

// Set the DOM input values
document.querySelector('#lock_x').value = 'start';
document.querySelector('#lock_y').value = 'start';
document.querySelector('#roll').value = 0;
document.querySelector('#handle').value = 0;


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

events = (e) => {

	let items = {};

	stopE(e);

	switch (e.target.id) {

		case 'lock_x':
			lockx = e.target.value;
			items.lockXTo = lockx;
			break;

		case 'lock_y':
			locky = e.target.value;
			items.lockYTo = locky;
			break;

		case 'roll':
			items.rotateOnPivot = (e.target.value === '1') ? true : false;
			break;

		case 'handle':
			items.addPivotHandle = (e.target.value === '1') ? true : false;
			break;
	}
	blocky.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Animation 
scrawl.makeAnimation({

	name: 'testC006Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			if (lockx === 'mouse') {

				blocky.set({
					lockXTo: (canvas.here.active) ? 'mouse' : 'start',
				});
			}

			if (locky === 'mouse') {

				blocky.set({
					lockYTo: (canvas.here.active) ? 'mouse' : 'start'
				});
			}

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

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
