import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup - create some useful variables for use elsewhere in the script
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	current, here;


// Create a new group to which we can assign the artefacts we want to drag around the stack
let hitGroup = scrawl.makeGroup({

	name: 'my-hit-group',
	host: stack.name,
});


// Generate new (DOM) element artefacts and add them to the stack via our new group
stack.addNewElement({

	name: 'basic-square',
	group: 'my-hit-group',
	tag: 'div',

	collides: true,

	text: 'Default square <div>',

	css: {
		border: '1px solid black',
		padding: '1em',
		textAlign: 'center',
		cursor: 'grab',
	},

}).clone({

	name: 'oval',

	startX: 150,
	startY: 50,
	width: 150,
	height: 'auto',

	classes: 'circle',
	text: 'Oval <div> with added class',

	css: {
		font: '12px monospace',
	},
});

// Clones will create literal clones of the element they are cloning. Thus cannot clone an element and attempt to change its tag value at the same time.
stack.addNewElement({

	name: 'list',
	group: hitGroup.name,
	tag: 'ul',

	width: '25%',
	height: 80,
	startX: 400,
	startY: 120,
	handleX: 'center',
	handleY: 'center',
	roll: 30,

	collides: true,

	classes: 'red-text',

	content: `<li>unordered list</li>
<li>with several</li>
<li>bullet points</li>`,

	css: {
		font: '12px fantasy',
		paddingInlineStart: '20px',
		paddingTop: '0.5em',
		margin: '0',
		border: '1px solid red',
		cursor: 'grab',
	},
	
}).clone({

	name: 'list-no-border',

	startY: 250,
	scale: 1.25,
	pitch: 60,
	yaw: 80,

	css: {
		border: 0,
	},
});


// Generate more elements - these ones won't be draggable: instead we will pivot them to the element artefacts generated above
stack.addNewElement({

	name: 'pivot-1',
	tag: 'div',

	width: 12,
	height: 12,
	handleX: 'center',
	handleY: 'center',

	pivot: 'basic-square',
	lockTo: 'pivot',
	order: 1,

	css: {
		backgroundColor: 'blue',
	},

}).clone({

	name: 'pivot-2',
	pivot: 'oval',

}).clone({

	name: 'pivot-3',
	pivot: 'list',

}).clone({

	name: 'pivot-4',
	pivot: 'list-no-border',
});


// Create the drag-and-drop zone
scrawl.makeDragZone({

	zone: stack,
	collisionGroup: hitGroup,
	endOn: ['up', 'leave'],
});


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
Pools - cell: ${scrawl.cellPoolLength()}; coordinate: ${scrawl.coordinatePoolLength()}; vector: ${scrawl.vectorPoolLength()}; quaternion: ${scrawl.quaternionPoolLength()}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: stack,
	afterShow: report,
});
