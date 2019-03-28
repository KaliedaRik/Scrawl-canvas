import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement,
	stopE, startDrag, endDrag, current;

stack.set({
	width: 500,
	height: 500,
});

// If we render the stack, we can then position the element accurately within it
stack.render()
.then(() => {

	element.set({
		collides: true,
		width: 100,
		height: 84,
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		css: {
			border: '1px solid blue',
			textAlign: 'center',
			paddingTop: '16px',
		},
		delta: {
			roll: 0.4
		}
	});

	resolve(true);
})
.catch(() => resolve(false));

// event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

startDrag = function (e) {

	stopE(e);

	if (stack.here.active) {

		current = stack.getArtefactAt().artefact;

		if (current) current.pickupArtefact(stack.here);
	}
};

endDrag = function (e) {

	stopE(e);
	
	if (current) {

		current.dropArtefact();
		current = false;
	}
};

scrawl.addListener('down', startDrag, stack.domElement);
scrawl.addListener(['up', 'leave'], endDrag, stack.domElement);

// Animation 
scrawl.makeAnimation({

	name: 'testD011Display',

	fn: function () {

		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				if (!stack.here.active) {

					if (current) {

						current.dropArtefact();
						current = false;
					}
				}

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
