import scrawl from '../source/scrawl.js'


// Setup
let canvas = scrawl.library.artefact.mycanvas;


// Create Phrase entity
let lorem = scrawl.makePhrase({

	name: 'myPhrase',

	startX: 300,
	startY: 200,
	handleX: '50%',
	handleY: '50%',
	width: '50%',

	text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',
	font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

	fillStyle: '#003399',

	method: 'fill',
	showBoundingBox: true,
});


// Setup some glyph styles on various parts of the phrase text
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


// Add a pivoted Wheel entity
scrawl.makeWheel({

	method: 'fillAndDraw',
	fillStyle: 'gold',
	strokeStyle: 'darkblue',

	radius: 5,
	handleX: 'center',
	handleY: 'center',

	pivot: 'myPhrase',
	lockTo: 'pivot',
});


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
	target: canvas,
	afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: lorem,

	useNativeListener: true,
	preventDefault: true,

	updates: {

		absoluteWidth: ['width', 'round'],

		start_xPercent: ['startX', '%'],
		start_xAbsolute: ['startX', 'round'],
		start_xString: ['startX', 'raw'],

		start_yPercent: ['startY', '%'],
		start_yAbsolute: ['startY', 'round'],
		start_yString: ['startY', 'raw'],

		handle_xPercent: ['handleX', '%'],
		handle_xAbsolute: ['handleX', 'round'],
		handle_xString: ['handleX', 'raw'],

		handle_yPercent: ['handleY', '%'],
		handle_yAbsolute: ['handleY', 'round'],
		handle_yString: ['handleY', 'raw'],

		roll: ['roll', 'float'],
		scale: ['scale', 'float'],

		upend: ['flipUpend', 'boolean'],
		reverse: ['flipReverse', 'boolean'],

		overline: ['overlinePosition', 'float'],
		letterSpacing: ['letterSpacing', 'float'],
		lineHeight: ['lineHeight', 'float'],
		justify: ['justify', 'raw'],
		family: ['family', 'raw'],

		size_string: ['size', 'raw'],
		size_px: ['size', 'px'],
	},
});


// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#overline').value = 0.1;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#lineHeight').value = 1.5;
document.querySelector('#letterSpacing').value = 0;
document.querySelector('#justify').options.selectedIndex = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
document.querySelector('#size_string').options.selectedIndex = 4;
