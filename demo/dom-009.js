import scrawl from '../source/scrawl.js'


// Scene variables
let artefact = scrawl.library.artefact,
	stack = artefact.mystack;



// Scene setup
stack.set({
	width: 600,
	height: 600,
});


// Create a group to hold all the circles
let circleGroup = scrawl.makeGroup({
	name: 'circles',
	host: 'mystack',
}).moveArtefactsIntoGroup('f_0', 'f_1', 'f_2', 'f_3', 'f_4', 'f_5', 'f_6', 'f_7', 'f_8', 'f_9', 'f_10', 'f_11', 'f_12', 'f_13', 'f_14', 'f_15', 'f_16', 'f_17', 'f_18', 'f_19', 'f_20', 'f_21', 'f_22', 'f_23', 'f_24', 'f_25', 'f_26', 'f_27', 'f_28', 'f_29', 'f_30', 'f_31', 'f_32', 'f_33', 'f_34', 'f_35', 'f_36', 'f_37', 'f_38', 'f_39', 'f_40', 'f_41', 'f_42', 'f_43', 'f_44', 'f_45', 'f_46', 'f_47', 'f_48', 'f_49');

// Simple random integer number generator
let getRandom = (n) => Math.round(Math.random() * n);

// Using a color factory object to generate random colors within a restricted palette
let colorFactory = scrawl.makeColor({
	name: 'myColorObject',
	rMax: 200,
	gMax: 50,
	bMax: 10,
});

circleGroup.artefacts.forEach(name => {

	let d = getRandom(50) + 50;

	let art = artefact[name];

	art.set({
		width: d,
		height: d,

		startX: `${getRandom(20) + 40}%`,
		startY: `${getRandom(20) + 40}%`,
		handleX: getRandom(500) - 250,
		handleY: getRandom(500) - 250,

		roll: getRandom(360),
		collides: true,

		delta: {
			roll: (getRandom(5) / 20) + 0.15
		},

		css: {
			backgroundColor: colorFactory.get('random'),
			border: '1px solid black',
		}
	});
});


// Create a group to hold the buttons
let buttonGroup = scrawl.makeGroup({
	name: 'buttons',
	host: 'mystack',
}).moveArtefactsIntoGroup('start_animation', 'stop_animation', 'start_listeners', 'stop_listeners');

// User controls setup
buttonGroup.setArtefacts({
	width: 240,
	height: 28,
	css: {
		textAlign: 'left',
	},
	domAttributes: {
		disabled: '',
	},
});

artefact.start_animation.set({
	startY: 0,
});
artefact.stop_animation.set({
	startY: 30,
	domAttributes: {
		disabled: 'disabled',
	},
});
artefact.start_listeners.set({
	startY: 60,
});
artefact.stop_listeners.set({
	startY: 90,
	domAttributes: {
		disabled: 'disabled',
	},
});

// The apply function triggers the artefact to render itself outside of the Scrawl-canvas display cycle - this will then trigger artefacts (in this case the 50 circles) to recalculate their positions so they can correctly place themselves within the Stack
stack.apply();


// Variable holds a value shared betwen two different functions
let targetsLength = 0;


// Clean up circles before the start of next display cycle
let reviewCircleClasses = function () {

	let firstRun = true;

	return function () {

		// we need the animation cycle to run once before we disable it
		if(firstRun){
			firstRun = false;
			scrawl.stopCoreAnimationLoop();
		}

		// updating the scene step 1 - clear out all instances of the 'make_opaque' CSS class from circles
		circleGroup.removeArtefactClasses('make_opaque');

		// updating the scene step 2 - check for hits on every iteration of the animation
		let targets = circleGroup.getAllArtefactsAt(stack.here);

		// updating the scene step 3 - add the 'make_opaque' CSS class to circles under the current cursor position
		targets.forEach(target => target.artefact.addClasses('make_opaque'));
		targetsLength = targets.length;
	};
}();


let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, text,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Hits: ${targetsLength}
Pools - 
    cell: ${scrawl.cellPoolLength()}
    quaternion: ${scrawl.quaternionPoolLength()}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: stack,
	commence: reviewCircleClasses,
	afterShow: report,
});


// Event listener for the buttons
let buttonControls = function () {

	let spinListener = false,
		startAnimationButton = artefact.start_animation, 
		stopAnimationButton = artefact.stop_animation, 
		startListenersButton = artefact.start_listeners, 
		stopListenersButton = artefact.stop_listeners;

	// Defining the spin event listener here
	let spin = (e) => {

		e.preventDefault();
		e.returnValue = false;

		if (e.target.id == 'mystack') {

			circleGroup.setDeltaValues({
				roll: 'reverse'
			});
		}
	};

	return function (e) {

		e.preventDefault();
		e.returnValue = false;

		switch (e.target.id) {

			case 'start_animation':
				scrawl.startCoreAnimationLoop();

				// the updateDomAttributes function is the same as using .set({ domAttributes: { whatever: 'something' }})
				startAnimationButton.updateDomAttributes('disabled', 'disabled');
				stopAnimationButton.updateDomAttributes('disabled', '');
				break;

			case 'stop_animation':
				scrawl.stopCoreAnimationLoop();

				startAnimationButton.updateDomAttributes('disabled', '');
				stopAnimationButton.updateDomAttributes('disabled', 'disabled');
				break;

			case 'start_listeners':
				// addListener returns a function that can be invoked to remove the event listener from the DOM
				spinListener = scrawl.addListener('up', spin, stack.domElement);

				startListenersButton.updateDomAttributes('disabled', 'disabled');
				stopListenersButton.updateDomAttributes('disabled', '');
				break;

			case 'stop_listeners':
				// Remove the spin event listener by invoking the function returned when creating it
				if (spinListener) spinListener();
				spinListener = false;

				startListenersButton.updateDomAttributes('disabled', '');
				stopListenersButton.updateDomAttributes('disabled', 'disabled');
				break;
		}
	};
}();

scrawl.addListener('up', buttonControls, '.controls');
