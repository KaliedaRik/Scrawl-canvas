import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement,
	ticker, stopE, changeDirection;

element.set({
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 200,
	width: 80,
	height: 30,
	css: {
		border: '1px solid blue',
		borderRadius: '50%',
		backgroundColor: 'red',
	}
});

// Create and start ticker and tween
ticker = scrawl.makeTicker({
	name: 'myTicker',
	cycles: 0,
	duration: '12s'
});

scrawl.makeTween({
	name: 'myTween',
	targets: element,
	ticker: 'myTicker',
	duration: '100%',
	time: 0,
	definitions: [
		{
			attribute: 'roll',
			start: 0,
			end: 360
		}
	]
});

// Build timeline actions
let red = { css: { backgroundColor: 'red' }},
	purple = { css: { backgroundColor: 'purple' }},
	brown = { css: { backgroundColor: 'brown' }},
	orange = { css: { backgroundColor: 'orange' }},
	yellow = { css: { backgroundColor: 'yellow' }},
	gray = { css: { backgroundColor: 'gray' }},
	green = { css: { backgroundColor: 'green' }},
	blue = { css: { backgroundColor: 'blue' }};

scrawl.makeAction({
	name: 'red',
	ticker: 'myTicker',
	targets: element,
	time: '6.25%',
	action: function () { element.set(red) },
	revert: function () { element.set(purple) }
}).clone({
	name: 'brown',
	time: '18.75%',
	action: function () { element.set(brown) },
	revert: function () { element.set(red) }
}).clone({
	name: 'orange',
	time: '31.25%',
	action: function () { element.set(orange) },
	revert: function () { element.set(brown) }
}).clone({
	name: 'yellow',
	time: '43.75%',
	action: function () { element.set(yellow) },
	revert: function () { element.set(orange) }
}).clone({
	name: 'gray',
	time: '56.25%',
	action: function () { element.set(gray) },
	revert: function () { element.set(yellow) }
}).clone({
	name: 'green',
	time: '68.75%',
	action: function () { element.set(green) },
	revert: function () { element.set(gray) }
}).clone({
	name: 'blue',
	time: '81.25%',
	action: function () { element.set(blue) },
	revert: function () { element.set(green) }
}).clone({
	name: 'purple_1',
	time: '93.75%',
	action: function () { element.set(purple) },
	revert: function () { element.set(blue) }
// Require extra actions to handle crossing the 0%/100% boundary
}).clone({
	name: 'purple_2',
	time: '100%',
	action: function () { element.set(purple) },
	revert: function () { element.set(purple) }
}).clone({
	name: 'purple_3',
	time: '0%',
	action: function () { element.set(purple) },
	revert: function () { element.set(purple) }
});

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

changeDirection = (e) => {

	stopE(e);
	ticker.reverse(true);
};

scrawl.addNativeListener('click', changeDirection, stack.domElement);

// start the ticker
ticker.run();

// Animation 
scrawl.makeAnimation({

	name: 'testD009Display',

	fn: function () {

		return new Promise((resolve) => {

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
