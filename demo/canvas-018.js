import scrawl from '../source/scrawl.js'


// Setup
let canvas = scrawl.library.artefact.mycanvas;


// Create Shape entitys for paths
scrawl.makeOval({

	name: 'oval-path',

	strokeStyle: 'black',
	method: 'draw',

	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',

	radiusX: '40%',
	radiusY: '42%',

	useAsPath: true,
});

let spiral = scrawl.makeSpiral({

	name: 'spiral-path',

	strokeStyle: 'darkgreen',
	method: 'draw',

	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',

	loops: 4,
	loopIncrement: 0.5,
	innerRadius: 20,

	flipReverse: true,
	roll: 30,

	useAsPath: true,
});


// Create Phrase entitys
scrawl.makePhrase({
	name: 'label',

	text: 'H&epsilon;lj&ouml;!',
	font: 'bold 40px Garamond, serif',

	width: 120,
	handleX: 'center',
	handleY: 'center',

	method: 'fillAndDraw',

	justify: 'center',
	lineHeight: 1,

	fillStyle: 'green',
	strokeStyle: 'gold',

	shadowOffsetX: 2,
	shadowOffsetY: 2,
	shadowBlur: 2,
	shadowColor: 'black',

	path: 'oval-path',
	lockTo: 'path',
	addPathRotation: true,

	delta: {
		pathPosition: 0.0008,
	}
});

let lorem = scrawl.makePhrase({

	name: 'myPhrase',

	text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',
	font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

	fillStyle: '#003399',

	method: 'fill',

	textPath: 'spiral-path',
	textPathPosition: 0.9,
	textPathDirection: 'rtl',

	delta: {
		textPathPosition: 0.0006,
	}
});

lorem.setGlyphStyles({

	defaults: true
}, 70, 126, 158).setGlyphStyles({

	fill: 'black'
}, 12).setGlyphStyles({

	style: 'italic'
}, 22).setGlyphStyles({

	style: 'normal'
}, 30).setGlyphStyles({

	variant: 'small-caps'
}, 42).setGlyphStyles({

	variant: 'normal'
}, 52).setGlyphStyles({

	weight: 'bold'
}, 67, 92, 155).setGlyphStyles({

	weight: 'normal'
}, 95).setGlyphStyles({

	highlight: true
}, 106).setGlyphStyles({

	highlight: false
}, 118).setGlyphStyles({

	underline: true
}, 140).setGlyphStyles({

	underline: false
}, 148).setGlyphStyles({

	overline: true
}, 102).setGlyphStyles({

	overline: false
}, 114).setGlyphStyles({

	size: '24px'
}, 123).setGlyphStyles({

	space: 10
}, 132).setGlyphStyles({

	space: 0
}, 135).setGlyphStyles({

	family: 'monospace'
}, 149);


// Create other entitys
scrawl.makePicture({

	name: 'bunny',
	imageSource: 'img/bunny.png',

	width: 26,
	height: 37,

	copyWidth: 26,
	copyHeight: 37,

	handleX: 'center',
	handleY: 'center',

	path: 'oval-path',
	pathPosition: .50,
	lockTo: 'path',
	addPathRotation: true,

	delta: {
		pathPosition: 0.0008,
	}
})


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, dragging,
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
	// target: canvas,
	afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: spiral,

	useNativeListener: true,
	preventDefault: true,

	updates: {

		start_xAbsolute: ['startX', 'round'],
		start_yAbsolute: ['startY', 'round'],
		handle_xAbsolute: ['handleX', 'round'],
		handle_yAbsolute: ['handleY', 'round'],

		roll: ['roll', 'float'],
		scale: ['scale', 'float'],
		upend: ['flipUpend', 'boolean'],
		reverse: ['flipReverse', 'boolean'],
	},
});

scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: lorem,

	useNativeListener: true,
	preventDefault: true,

	updates: {

		overline: ['overlinePosition', 'float'],
		letterSpacing: ['letterSpacing', 'float'],
		family: ['family', 'raw'],
		size_px: ['size', 'px'],

		direction: ['textPathDirection', 'raw'],
	},
});

// Setup form
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 1;
document.querySelector('#direction').options.selectedIndex = 1;
document.querySelector('#overline').value = 0.1;
document.querySelector('#letterSpacing').value = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
