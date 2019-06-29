import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	flower = artefact.flower,
	leftbox = artefact.leftbox,
	rightbox = artefact.rightbox,
	deltaX = 0.4,
	deltaY = -0.3,
	currentClass = '';


// Create a new group for the box elements, against which we will be checking for hits - the box elements have been imported already and assigned to the Stack's default group, but we can move them to the new group using .set()
let hitgroup = scrawl.makeGroup({
	name: 'hitareas',
	host: 'mystack',
});


stack.set({
	width: 600,
	height: 400,
	css: {
		overflow: 'hidden',
		resize: 'both'
	}
});

rightbox.set({
	group: 'hitareas',

	startX: '55%',
	startY: '15%',
	roll: 10,

	css: {
		backgroundColor: 'rgba(255, 0, 0, 0.4)'
	}
});

leftbox.set({
	group: hitgroup.name,

	startX: '10%',
	startY: '35%',

	css: {
		backgroundColor: 'rgba(0, 0, 255, 0.4)'
	}
});

hitgroup.setArtefacts({
	width: '35%',
	height: '50%',
	
	collides: true,
});

flower.set({
	width: 200,
	height: 200,
	startX: '50%',
	startY: '50%',
	handleX: 'center',
	handleY: 'center',
	classes: 'make_round',
	delta: {
		startX: `${deltaX}%`,
		startY: `${deltaY}%`,
		roll: 0.5,
	},
});

// When changing a Stack's attributes as part of setup, there's no guarantee on the order in which the attributes will be updated. Because setting the actionResize attribute to 'true' leads to an impromptu DOM update, it's often best to leave setting this attribute to the end of the scene setup. The DOM update will make sure all the Stack's constituent elements pick up the new Stack dimensions on the next regular render cycle
stack.set({
	actionResize: true,
});


/*
Boundary checking can get very messy very quickly, particularly when using delta animation. The following boilerplate will work in many situations:

	1. check to see if the artefact has crossed the boundary. If it has, then...
    2. reverse the artefact away from the boundary along the path it has just travelled along
    3. check to see which of the delta values needs to be updated - for bouncing an artefact around an enclosed box, reversing the sign on the appropriate delta value is often enough
    4. move the artefact forward using its new delta values
*/
let checkForFlowerBoundaryCollisions = function () {

	// Step 0 - determine the current boundary values (in this case they are dynamic, relative to the current dimensions of the Stack) and the current position of the flower element (again, a dynamic coordinate relative to Stack dimensions)
	// let start, dims, changes, 
	// 	minX, minY, maxX, maxY;

	let start = flower.getBasicData(),
		dims = stack.getBasicData(),
		minX = dims.w / 10,
		minY = dims.h / 10,
		maxX = minX * 9,
		maxY = minY * 9;

	// Step 1 - check to see if the flower start coordinate has moved beyond the boundary
	if (start.x < minX || start.x > maxX || start.y < minY || start.y > maxY) {

		// Step 2 - reverse out of danger
		flower.reverseByDelta();

		// Step 3 - update the appropriate delta values for the flower
		let changes = {};

		if (start.x < minX || start.x > maxX) {

			deltaX = -deltaX;
			changes.startX = `${deltaX}%`;
		}
		if (start.y < minY || start.y > maxY) {

			deltaY = -deltaY;
			changes.startY = `${deltaY}%`;
		}

		flower.set({
			delta: changes
		});

		// Step 4 - move forward away from the boundary
		flower.updateByDelta();
	}
};

// Updating the flower's DOM element's class attribute
let checkForFlowerClassUpdates = function () {

	let start = flower.getBasicData(),
		current = hitgroup.getArtefactAt(start).artefact;

	if (current && !currentClass) {

		currentClass = (current.name === 'leftbox') ? 'make_blue' : 'make_red';
		flower.addClasses(currentClass);
	}
	else if (!current && currentClass) {

		flower.removeClasses(currentClass);
		currentClass = '';
	}
};

// Combining the two check functions above into a single function
let commenceActions = function () {

	checkForFlowerBoundaryCollisions();
	checkForFlowerClassUpdates();
};


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Current classes: "${flower.get('classes')}"
Pools - cell: ${scrawl.cellPoolLength()}; coordinate: ${scrawl.coordinatePoolLength()}; vector: ${scrawl.vectorPoolLength()}; quaternion: ${scrawl.quaternionPoolLength()}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	commence: commenceActions,
	target: stack,
	afterShow: report,
});

console.log(scrawl.library)