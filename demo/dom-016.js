import scrawl from '../source/scrawl.js'

// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	startAnimationButton = artefact.start_animation, 
	stopAnimationButton = artefact.stop_animation, 
	startListenersButton = artefact.start_listeners, 
	stopListenersButton = artefact.stop_listeners,
	circleGroup,
	controls, stopE, spin, 
	firstRun = true,
	item, i, iz,
	getRandom = (n) => Math.round(Math.random() * n);

circleGroup = scrawl.makeGroup({
	name: 'circles',
	host: 'mystack',
}).moveArtefactsIntoGroup('f_0', 'f_1', 'f_2', 'f_3', 'f_4', 'f_5', 'f_6', 'f_7', 'f_8', 'f_9', 'f_10', 'f_11', 'f_12', 'f_13', 'f_14', 'f_15', 'f_16', 'f_17', 'f_18', 'f_19');

stack.set({
	width: 600,
	height: 600,
}).render()
.then(() => {

	for (i = 0, iz = circleGroup.artefacts.length; i < iz; i++) {

		let d = getRandom(50) + 50;

		item = artefact[circleGroup.artefacts[i]];

		item.set({
			width: d,
			height: d,
			startX: `${getRandom(20) + 40}%`,
			startY: `${getRandom(20) + 40}%`,
			handleX: getRandom(500) - 250,
			handleY: getRandom(500) - 250,
			roll: getRandom(360),
			collides: true,
			delta: {
				roll: (getRandom(5) / 10) + 0.25
			},
			css: {
				backgroundColor: `rgb(${getRandom(255)}, ${getRandom(255)}, ${getRandom(255)})`
			}
		}).apply();
	}

	startAnimationButton.set({
		startY: 0,
		width: 240,
		height: 28,
		css: {
			textAlign: 'left'
		}
	});
	stopAnimationButton.set({
		startY: 30,
		width: 240,
		height: 28,
		css: {
			textAlign: 'left'
		}
	});
	startListenersButton.set({
		startY: 60,
		width: 240,
		height: 28,
		css: {
			textAlign: 'left'
		}
	});
	stopListenersButton.set({
		startY: 90,
		width: 240,
		height: 28,
		css: {
			textAlign: 'left'
		}
	});
	startAnimationButton.domElement.disabled = false;
	stopAnimationButton.domElement.disabled = true;
	startListenersButton.domElement.disabled = false;
	stopListenersButton.domElement.disabled = true;
})
.catch(() => {});

// event listeners
stopE = (e) => {

	if (e) {
		e.preventDefault();
		e.returnValue = false;
	}
};

spin = (e) => {

	if (e.target.id == 'mystack') {

		circleGroup.setDeltaValues({
			roll: true
		}, 'reverse');
	}
}

controls = (e) => {

	stopE(e);

	switch (e.target.id) {

		case 'start_animation':
			scrawl.startCoreAnimationLoop();
			startAnimationButton.domElement.disabled = true;
			stopAnimationButton.domElement.disabled = false;
			break;

		case 'stop_animation':
			scrawl.stopCoreAnimationLoop();
			startAnimationButton.domElement.disabled = false;
			stopAnimationButton.domElement.disabled = true;
			break;

		case 'start_listeners':
			scrawl.addListener('up', spin, stack.domElement);
			startListenersButton.domElement.disabled = true;
			stopListenersButton.domElement.disabled = false;
			break;

		case 'stop_listeners':
			scrawl.removeListener('up', spin, stack.domElement);
			startListenersButton.domElement.disabled = false;
			stopListenersButton.domElement.disabled = true;
			break;
	}
};

scrawl.addListener('up', controls, '.controls');

// Animation loop
scrawl.makeAnimation({

	name: 'testD016Display',

	fn: function () {

		return new Promise((resolve) => {

			if(firstRun){
				firstRun = false;
				scrawl.stopCoreAnimationLoop();
			}

			let targets;

			circleGroup.removeArtefactClasses('make_opaque');

			targets = circleGroup.getAllArtefactsAt(stack.here);

			for(i = 0, iz = targets.length; i < iz; i++) {
				targets[i].addClasses('make_opaque');
			}

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}<br />Hits: ${targets.length}`;

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
