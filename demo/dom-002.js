import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement,
	stopE, events,
	xLock = 'mouse',
	yLock = 'start';


element.set({
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	width: 140,
	height: 160,
	lockTo: 'start'
});

document.getElementById('vertical').value = 0;
document.getElementById('horizontal').value = 1;

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};
events = (e) => {

	stopE(e);

	switch (e.target.id) {

		case 'horizontal':
			xLock = (parseInt(e.target.value, 10)) ? 'mouse' : 'start';
			break;

		case 'vertical':
			yLock = (parseInt(e.target.value, 10)) ? 'mouse' : 'start';
			break;
	}
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

scrawl.makeAnimation({

	// Naming the animation object is not required, but will help with debugging.
	name: 'testD002Display',

	fn: function () {

		return new Promise((resolve) => {

			element.set({
				lockXTo: (stack.here.active) ? xLock : 'start',
				lockYTo: (stack.here.active) ? yLock : 'start'
			});

			// The Display Cycle scrawl functions (.clear, .compile, .show, .render) all return promises which must be handled accordingly.
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

console.log(scrawl.library);