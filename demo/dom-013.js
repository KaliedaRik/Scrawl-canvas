import scrawl from '../source/scrawl.js'

// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	flower = artefact.flower;

stack.set({
	width: 600,
	height: 400,
// We .render here to fix initial dimensional changes to the stack. All other setup work can then go in the .then function. This is because of JavsScript's run-to-completion design, meaning that if we don't put the code inside a .then function it will run before the .render Promise triggers.
}).render()
.then(() => {

	// Best to keep initial dimension changes and actionResize settings separate from each other.
	stack.set({
		actionResize: true,
		css: {
			overflow: 'hidden',
			resize: 'both'
		}
	});

	flower.set({
		width: 200,
		height: 200,
		startX: '50%',
		startY: '50%',
		handleX: 'center',
		handleY: 'center',
		delta: {
			startX: '0.4%',
			startY: '-0.3%',
			roll: 0.5,
		},
		css: {
			borderRadius: '50%'
		}
	// For elements in the stack, it is enough to .apply the changes (which, unlike .render, is not a Promise function)
	}).apply();

})
.catch(() => {});

// Animation loop
scrawl.makeAnimation({

	name: 'testD013Display',

	fn: function () {

		return new Promise((resolve) => {

			// Display cycle
			let start, dims, changes,
				minX, minY, maxX, maxY;

			start = flower.getStart();
			dims = stack.getDimensions();
			minX = dims.w / 10;
			minY = dims.h / 10;
			maxX = minX * 9;
			maxY = minY * 9;

			// Check to see if the image needs to reverse direction
			if (start.x < minX || start.x > maxX || start.y < minY || start.y > maxY) {

				flower.reverseByDelta();

				changes = {};
				if (start.x < minX || start.x > maxX) {
					changes.startX = true;
				}
				if (start.y < minY || start.y > maxY) {
					changes.startY = true;
				}

				flower.setDeltaValues(changes, 'reverse');
				flower.updateByDelta();
			}

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
})
