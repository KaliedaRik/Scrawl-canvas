import scrawl from '../source/scrawl.js'

// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

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
	css: {
		border: '1px solid blue',
		borderRadius: '50%',
		backgroundColor: 'lightblue'
	}
});

// Create and start tween
scrawl.makeTween({
	name: 'myTween',
	duration: 15000,
	cycles: 0,
	targets: element,
	definitions: [
		{
			attribute: 'roll',
			start: 0,
			end: 360
		},
		{
			attribute: 'handleY',
			start: 200,
			end: 50,
			engine: 'easeOut'
		}
	]
}).run();

// Animation 
scrawl.makeAnimation({

	name: 'testD005Display',
	
	fn: function(){
		
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
