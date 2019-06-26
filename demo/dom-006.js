import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement;

element.set({
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 200,
	width: 80,
	height: 30,
	text: 'BOAT',
	css: {
		border: '1px solid blue',
		borderRadius: '50%',
		textAlign: 'center',
		padding: '12px 0 0 0',
	}
}).clone({
	name: 'mysecondelement',
	handleY: 150,
	scale: 0.9,
	css: {
		backgroundColor: 'lightblue',
	}
}).clone({
	name: 'mythirdelement',
	handleY: 100,
	scale: 0.8,
	roll: -40,
	css: {
		backgroundColor: 'lightgreen',
	}
});


// Create, and start, tickers and tweens
let ticker = scrawl.makeTicker({
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
}).clone({
	name: 'myClonedTween',
	targets: artefact.mysecondelement,
	definitions: [
		{
			attribute: 'roll',
			start: -20,
			end: 340
		}
	]
}).clone({ 
	name: 'mySecondClonedTween',
	targets: artefact.mythirdelement,
	useNewTicker: true,
	duration: '10s',
	cycles: 0,
	definitions: [
		{
			attribute: 'roll',
			start: -40,
			end: 320
		}
	]
});

let smallboat = scrawl.library.tween.mySecondClonedTween;


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

ticker.run();
smallboat.run();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Pools - cell: ${scrawl.cellPoolLength()}; coordinate: ${scrawl.coordinatePoolLength()}; vector: ${scrawl.vectorPoolLength()}; quaternion: ${scrawl.quaternionPoolLength()}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: stack,
	afterShow: report,
});


// The event listener will reverse direction on the larger boats, while halting/restarting the smallest boat
let changeDirection = (e) => {

	e.preventDefault();
	e.returnValue = false;

	ticker.reverse(true);

	if (smallboat.isRunning()) smallboat.halt();
	else smallboat.resume();
};

scrawl.addNativeListener('click', changeDirection, stack.domElement);
