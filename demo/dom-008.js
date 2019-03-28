import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
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
	css: {
		border: '1px solid blue',
		borderRadius: '50%',
		backgroundColor: 'lightblue',
		textAlign: 'center',
		padding: '10px 0 0 0',
	}
}).clone({
	name: 'mysecondelement',
	handleY: 150,
	scale: 0.9,
	css: {
		backgroundColor: 'pink'
	}
}).clone({
	name: 'mythirdelement',
	handleY: 100,
	scale: 0.8,
	css: {
		backgroundColor: 'lightgreen'
	}
});

// Create and start tweens
scrawl.makeTween({
	name: 'myTween',
	duration: 12000,
	cycles: 0,
	targets: element,
	definitions: [
		{
			attribute: 'roll',
			start: 0,
			end: 360
		}
	]
// this works because the first tween creates its own ticker, then the cloned tween subscribes to that ticker
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
// second clone has its own ticker (useNewTicker: true), which needs to be run separately
}).run().clone({ 
	name: 'mySecondClonedTween',
	targets: artefact.mythirdelement,
	useNewTicker: true,
	definitions: [
		{
			attribute: 'roll',
			start: -40,
			end: 320
		}
	]
}).run(); 

// Animation 
scrawl.makeAnimation({

	name: 'testD008Display',

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
