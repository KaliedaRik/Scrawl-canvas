import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
let library = scrawl.library,
	artefact = library.artefact,
	stack = artefact.mystack,
	rocket, tween, clone, stopE, flyRocket;

stack.set({
	width: 300,
	height: 600,
	css: {
		overflow: 'hidden'
	}
});

stack.addDomElementToStack('#rocket');
rocket = artefact.rocket;

rocket.set({
	startX: 600,
	startY: 540,
	width: 50,
	height: 100,
	handleX: 570,
	handleY: 'center',
});

// set this tween up as a template which can be cloned but will never itself run
tween = scrawl.makeTween({
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

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

flyRocket = function(e) {

	stopE(e);

	clone = tween.clone({

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

// Animation 
scrawl.makeAnimation({

	name: 'testD010Display',

	fn: function () {

		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				let t = Object.keys(library.tween),
					a = Object.keys(artefact),
					n = Object.keys(library.animation),
					k = Object.keys(library.animationtickers),
					e = Object.keys(library.element);

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />tween - ${t.length}, ${library.tweennames.length}: ${JSON.stringify(library.tweennames)}
				<br />artefact - ${a.length}, ${library.artefactnames.length}: ${JSON.stringify(library.artefactnames)}
				<br />element - ${e.length}, ${library.elementnames.length}: ${JSON.stringify(library.elementnames)}
				<br />tickers - ${k.length}, ${library.animationtickersnames.length}: ${JSON.stringify(library.animationtickersnames)}
				<br />animation - ${n.length}, ${library.animationnames.length}: ${JSON.stringify(library.animationnames)}`;

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
