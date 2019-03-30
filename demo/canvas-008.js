import scrawl from '../source/scrawl.js'


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	porthole = artefact.porthole,
	starling, addStars, stopE, makeStars,
	starCount = 0,
	addNumber = 100;

porthole.set({
	backgroundColor: 'black',
	css: {
		borderRadius: '50%'
	}
});

starling = scrawl.makeWheel({
	name: 'starling',
	radius: 3,
	handleX: 'center',
	handleY: 'center',
	method: 'fill',
	fillStyle: 'white',
});

makeStars = function (buildNumber) {

	let star, i,
		r1, v, duration, scale;

	for (i = 0; i < buildNumber; i++) {
		starCount++;

		star = starling.clone({
			name: `star_${starCount}`,
			fastStamp: true,
			sharedState: true,
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

	starling.set({
		fillStyle: `rgb(${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200})`
	});
}


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

addStars = (e) => {

	stopE(e);
	makeStars(addNumber);
};

scrawl.addNativeListener('click', addStars, porthole.domElement);

// Generate the initial stars
makeStars(100);


// Animation 
scrawl.makeAnimation({

	name: 'testC008Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />Stars: ${starCount}`;

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
