import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let library = scrawl.library,
	artefact = library.artefact,
	stack = artefact.mystack;

stack.set({
	width: 300,
	height: 600,
	css: {
		overflow: 'hidden'
	}
});

stack.addExistingDomElements('#rocket');
let rocket = artefact.rocket;

rocket.set({
	startX: 600,
	startY: 540,
	width: 50,
	height: 100,
	handleX: 570,
	handleY: 'center',
});


// Set a tween up as a template which can be cloned, but will never itself run
let tween = scrawl.makeTween({
	name: 'template',
	duration: 5000,
	killOnComplete: true,
	useNewTicker: true,
	definitions: [
		{
			attribute: 'roll',
			start: 0,
			end: 65
		}
	]
}).removeFromTicker();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		let t = Object.keys(library.tween),
			a = Object.keys(artefact),
			n = Object.keys(library.animation),
			k = Object.keys(library.animationtickers),
			e = Object.keys(library.element);

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
tween - ${t.length}, ${library.tweennames.length}: ${t.join(', ')}
artefact - ${a.length}, ${library.artefactnames.length}: ${a.join(', ')}
element - ${e.length}, ${library.elementnames.length}: ${e.join(', ')}
tickers - ${k.length}, ${library.animationtickersnames.length}: ${k.join(', ')}
animation - ${n.length}, ${library.animationnames.length}: ${n.join(', ')}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: stack,
	afterShow: report,
});


// Create event listener to generate and start new element and tween
let flyRocket = function(e) {

	e.preventDefault();
	e.returnValue = false;

	tween.clone({

		commenceAction: function () {

			this.set({
				targets: rocket.clone()
			});
		},

		completeAction: function () {

			this.targets[0].demolish(true);
		}
	}).run();
};

scrawl.addNativeListener('click', flyRocket, stack.domElement);
