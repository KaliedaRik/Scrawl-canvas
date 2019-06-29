import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


/*
Google Analytics code - loaded in the normal way through markup in the dom-006.html file (lines 11-21)

Create a new tracker to handle tween and ticker action/progress, and set some attributes on it. 

We can then incorporate the tracker's functionality in our various hook functions defined further down in this script
*/ 
let ga = window[window['GoogleAnalyticsObject'] || 'ga'],
	myTracker;

ga('create', 'UA-000000-0', 'auto', 'demoCanvasTracker');

ga(function() {
	myTracker = ga.getByName('demoCanvasTracker');
	myTracker.set('transport', 'beacon');
	myTracker.set('campaignKeyword', 'Scrawl-canvas demo');
});


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

}).clone({
	name: 'purple_2',
	time: '0%',
	action: function () { element.set(purple) },
	revert: function () { element.set(purple) }
});



/*
Add some Google Analytics progress actions to one of the tickers

ISSUE: 0% times will fire the action function when the ticker is moving both forwards and backwards, but never fires the revert function. I don't consider this to be a show stopper.
*/
scrawl.makeAction({

	ticker: 'myTicker',

	name: 'lapStarted',
	time: '0%',

	action: function () { 
		myTracker.send('event', 'Ticker progress', 'Ticker loop starting (forwards)', `Action ${this.name} on ${this.ticker}`) ;
	},

	revert: function () { 
		myTracker.send('event', 'Ticker progress', 'Ticker loop starting (reversed)', `Action ${this.name} on ${this.ticker}`); 
	},

}).clone({

	name: 'lapCompleted',
	time: '100%',

	action: function () { 
		myTracker.send('event', 'Ticker progress', '100% complete (forwards)', `Action ${this.name} on ${this.ticker}`); 
	},

	revert: function () { 
		myTracker.send('event', 'Ticker progress', '100% complete (reversed)', `Action ${this.name} on ${this.ticker}`); 
	},

}).clone({

	name: 'halfwayThere',
	time: '50%',

	action: function () { 
		myTracker.send('event', 'Ticker progress', '50% complete (forwards)', `Action ${this.name} on ${this.ticker}`); 
	},

	revert: function () { 
		myTracker.send('event', 'Ticker progress', '50% complete (reversed)', `Action ${this.name} on ${this.ticker}`); 
	},
});


// Also add some Google Analytics code to one of the tweens
let smallboat = scrawl.library.tween.mySecondClonedTween;

smallboat.set({

	onHalt: function () { 
		myTracker.send('event', 'Tween state', 'halt', `Tween ${this.name} on ${this.ticker}`) 
	},

	onResume: function () { 
		myTracker.send('event', 'Tween state', 'resume', `Tween ${this.name} on ${this.ticker}`) 
	},
});

// Start the animation
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

console.log(scrawl.library)