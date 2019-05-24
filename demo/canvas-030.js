import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


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

	method: 'fillDraw',

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
	addPathRoll: true,

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
	addPathRoll: true,

	delta: {
		pathPosition: 0.0008,
	}
})

// Event listeners
let stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

let events = (e) => {

	let items = {},
		flag = false;

	stopE(e);

	switch (e.target.id) {

		case 'start_xAbsolute':
			items.startX = Math.round(e.target.value);
			break;

		case 'start_yAbsolute':
			items.startY = Math.round(e.target.value);
			break;

		case 'handle_xAbsolute':
			items.handleX = Math.round(e.target.value);
			break;

		case 'handle_yAbsolute':
			items.handleY = Math.round(e.target.value);
			break;

		case 'roll':
			items.roll = parseFloat(e.target.value);
			break;

		case 'scale':
			items.scale = parseFloat(e.target.value);
			break;

		case 'upend':
			items.flipUpend = (e.target.value === '1') ? true : false;
			break;

		case 'reverse':
			items.flipReverse = (e.target.value === '1') ? true : false;
			break;

		case 'overline':
			items.overlinePosition = parseFloat(e.target.value);
			flag = true;
			break;

		case 'letterSpacing':
			items.letterSpacing = parseFloat(e.target.value);
			flag = true;
			break;

		case 'family':
			items.family = e.target.value;
			flag = true;
			break;

		case 'size_px':
			items.size = `${e.target.value}px`;
			flag = true;
			break;

		case 'direction':
			items.textPathDirection = e.target.value;
			flag = true;
			break;
	}

	if (flag) lorem.set(items);
	else spiral.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


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


// Animation 
scrawl.makeAnimation({

	name: 'testC029Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

				resolve(true);
			})
			.catch((err) => {

				testTicker = Date.now();
				testMessage.textContent = (err.substring) ? err : JSON.stringify(err);

				resolve(false);
			});
		});
	}
});
console.log(scrawl.library.entity)
