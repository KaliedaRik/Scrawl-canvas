import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	porthole = artefact.porthole,
	wormhole = porthole.base,
	starling, addStars, stopE, makeStars,
	starBag = [],
	changeFlag = true,
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

		// Rather than tween the entity object directly, we can supply the tween with a Scrawl userobject to hold the tween results, and then apply those changes to a single entity as part of the display cycle. Userobjects are not stored in the Scrawl library, so need to be captured in array in our code.
		star = scrawl.makeUserObject({});
		starBag.push(star);
		starCount++;

		r1 = Math.random();

		v = scrawl.requestVector({
			x: 1
		}).rotate(Math.random() * 360).scalarMultiply(300);

		duration = Math.round((r1 * 3000) + 2000);
		scale = Math.round((1 - r1) * 0.9) + 0.6;

		scrawl.makeTween({
			name: `star_${starCount}`,
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

	name: 'testC009Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			// Rather than render the canvas, we can break it down into its three constituent parts (clear, compile, show) - this allows us to have greater control over the compile step. Each of the three steps returns a Promise function.
			porthole.clear()
			.then(() => {

				// When the entity fastStamp attribute is true, the entity will bypass checking for changes to the canvas's context engine
				if (changeFlag) starling.fastStamp = false;

				// Normally the compile cascade will stamp an entity onto the canvas once. We use just the one entity for this scene, stamping it onto the canvas many times over using its simpleStamp function.
				starBag.forEach(shiny => starling.simpleStamp(wormhole, shiny));
				return true;
			})
			.then(() => {

				// Switching on the entity fastStamp attribute on helps speed up the display cycle.
				if (changeFlag) {

					starling.fastStamp = true;
					changeFlag = false;
				}

				return porthole.show();
			})
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
