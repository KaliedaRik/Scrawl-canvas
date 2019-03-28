import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
let artefact = scrawl.library.artefact,
	porthole = artefact.porthole,
	starfield = porthole.domElement,
	starHold = document.querySelector('#starHold'),
	addStars, stopE, makeStars,
	starCount = 0,
	addNumber = 25;

porthole.set({
    width: 600,
    height: 600,
	perspectiveZ: 100,
	css: {
		overflow: 'hidden',
		borderRadius: '50%',
		backgroundColor: 'black',
	}
});

// Create and start tweens
makeStars = function (buildNumber) {

	let starling, star, id, i,
		r1, v, duration, scale;

	for (i = 0; i < buildNumber; i++) {

		starCount++;

		starling = document.createElement('img');
		id = `star_${starCount}`;
		starling.id = id;
		starling.src = "img/gsapdot.png";

		starHold.appendChild(starling);
		porthole.addDomElementToStack(starling);

		star = artefact[id];

		if (star) {

			star.set({
				width: 8,
				height: 8,
				startX: 300,
				startY: 300,
				handleX: 'center',
				handleY: 'center'
			});

			r1 = Math.random();

			v = scrawl.requestVector({
				x: 1
			}).rotate(Math.random() * 360).scalarMultiply(300);

			duration = Math.round((r1 * 3000) + 2000);
			scale = Math.round((1 - r1) * 0.9) + 0.6;

			scrawl.makeTween({

				name: star.name,
				targets: star,
				duration: duration,
				cycles: 0,

				definitions: [{
					attribute: 'startX',
					integer: true,
					start: 300,
					end: 300 + v.x
				}, {
					attribute: 'startY',
					integer: true,
					start: 300,
					end: 300 + v.y
				}, {
					attribute: 'scale',
					start: 0.5,
					end: scale
				}]

			}).run();

			scrawl.releaseVector(v);
		}
	}
}

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

addStars = (e) => {

	stopE(e);
	makeStars(addNumber);
};

scrawl.addNativeListener('click', addStars, starfield);

makeStars(50);

// Animation 
scrawl.makeAnimation({

	name: 'testD007Display',

	fn: function () {

		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}<br />Stars: ${starCount}`;

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
