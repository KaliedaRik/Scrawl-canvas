import scrawl from '../source/scrawl.js'

// time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	cube = artefact.cube,
	faces,
	deltaRoll = 0.4,
	deltaPitch = 0.8,
	deltaYaw = 1.2;

faces = scrawl.makeGroup({
	name: 'faces',
	host: 'mystack',
}).addArtefacts('leftface', 'rightface', 'topface', 'bottomface', 'frontface', 'backface');

stack.set({
	perspectiveX: '50%',
	perspectiveY: '50%',
	perspectiveZ: 1000
});

cube.set({
	order: 1,
	width: 0,
	height: 0,
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	lockTo: 'start',
	css: {
		border: '20px solid black',
	}
})

faces.setArtefacts({
	order: 2,
	width: 200,
	height: 200,
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	offsetZ: 100,
	lockTo: 'pivot',
	pivot: 'cube',
	rotateOnPivot: true,
	css: {
		border: '1px solid blue',
		textAlign: 'center'
	}
});

artefact.frontface.set({
	css: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
});
artefact.rightface.set({
	css: { backgroundColor: 'rgba(0, 0, 127, 0.4)' },
	yaw: 90,
});
artefact.topface.set({
	css: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
	pitch: 90,
});
artefact.backface.set({
	css: { backgroundColor: 'rgba(127, 0, 0, 0.4)' },
	pitch: 180,
});
artefact.leftface.set({
	css: { backgroundColor: 'rgba(0, 0, 255, 0.4)' },
	yaw: 270,
});
artefact.bottomface.set({
	css: { backgroundColor: 'rgba(0, 127, 0, 0.4)' },
	pitch: 270,
});

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

				cube.set({
					lockTo: (stack.here.active) ? 'mouse' : 'start',
				}).setDelta({
					roll: deltaRoll,
					pitch: deltaPitch,
					yaw: deltaYaw
				});

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
