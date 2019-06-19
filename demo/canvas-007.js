import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});


// Create gradients
scrawl.makeGradient({
	name: 'linear1',
	endX: '100%',
})
.updateColor(0, 'pink')
.updateColor(999, 'darkgreen');

scrawl.makeGradient({
	name: 'linear2',
	endX: '100%',
})
.updateColor(0, 'darkblue')
.updateColor(999, 'white');

scrawl.makeGradient({
	name: 'linear3',
	endX: '100%',
})
.updateColor(0, 'yellow')
.updateColor(999, 'purple');

scrawl.makeGradient({
	name: 'linear4',
	endX: '100%',
})
.updateColor(0, 'black')
.updateColor(999, 'coral');


// Create entitys
let block1 = scrawl.makeBlock({
	name: 'b1',
	width: '70%',
	height: '70%',
	startX: '5%',
	startY: '5%',
	fillStyle: 'linear1',
	lockFillStyleToEntity: true,
	strokeStyle: 'coral',
	lineWidth: 4,
	method: 'fillDraw',
});

let block2 = block1.clone({
	name: 'b2',
	startX: '45%',
	startY: '47%',
	handleX: 'center',
	handleY: 'center',
	scale: 0.5,
	fillStyle: 'linear2',
	strokeStyle: 'red',
	delta: {
		roll: -0.5
	},
	order: 1,
});

let wheel1 = scrawl.makeWheel({
	name: 'w1',
	radius: '20%',
	startX: '70%',
	startY: '30%',
	handleX: 'center',
	handleY: 'center',
	fillStyle: 'linear3',
	lockFillStyleToEntity: true,
	strokeStyle: 'orange',
	lineWidth: 4,
	method: 'fillDraw',
});

let wheel2 = wheel1.clone({
	name: 'w2',
	startX: '32%',
	startY: '82%',
	handleX: '15%',
	handleY: 'center',
	scale: 0.7,
	fillStyle: 'linear4',
	strokeStyle: 'lightblue',
	delta: {
		roll: 1
	},
	order: 1,
});


// Define filters - need to test them all, plus some user-defined filters

// Grayscale filter
scrawl.makeFilter({
	name: 'grayscale',
	method: 'grayscale',

// Sepia filter
}).clone({
	name: 'sepia',
	method: 'sepia',

// Invert filter
}).clone({
	name: 'invert',
	method: 'invert',

// Red filter
}).clone({
	name: 'red',
	method: 'red',

// Green filter
}).clone({
	name: 'green',
	method: 'green',

// Blue filter
}).clone({
	name: 'blue',
	method: 'blue',

// Notred filter
}).clone({
	name: 'notred',
	method: 'notred',

// Notgreen filter
}).clone({
	name: 'notgreen',
	method: 'notgreen',

// Notblue filter
}).clone({
	name: 'notblue',
	method: 'notblue',

// Cyan filter
}).clone({
	name: 'cyan',
	method: 'cyan',

// Magenta filter
}).clone({
	name: 'magenta',
	method: 'magenta',

// Yellow filter
}).clone({
	name: 'yellow',
	method: 'yellow',
});

// Chroma (green screen) filter
scrawl.makeFilter({
	name: 'chroma',
	method: 'chroma',
	ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]],
});

// Brightness filter
scrawl.makeFilter({
	name: 'brightness',
	method: 'brightness',
	level: 0.5,

// Saturation filter
}).clone({
	name: 'saturation',
	method: 'saturation',
	level: 1.4,

// Threshhold filter
}).clone({
	name: 'threshold',
	method: 'threshold',
	level: 127,
	lowRed: 100,
	lowGreen: 0,
	lowBlue: 0,
	highRed: 220,
	highGreen: 60,
	highBlue: 60,
});

// Channels filter
scrawl.makeFilter({
	name: 'channels',
	method: 'channels',
	red: 0.4,
	green: 0.8,
	blue: 0.6,

// Channelstep filter
}).clone({
	name: 'channelstep',
	method: 'channelstep',
	red: 64,
	green: 64,
	blue: 64,
});

// Tint filter
scrawl.makeFilter({
	name: 'tint',
	method: 'tint',
	redInRed: 0.5,
	redInGreen: 1,
	redInBlue: 0.9,
	greenInRed: 0,
	greenInGreen: 0.3,
	greenInBlue: 0.8,
	blueInRed: 0.8,
	blueInGreen: 0.8,
	blueInBlue: 0.4,
});

// Pixellate filter
scrawl.makeFilter({
	name: 'pixelate',
	method: 'pixelate',
	tileWidth: 20,
	tileHeight: 20,
	offsetX: 8,
	offsetY: 8,
});

// Blur filter
scrawl.makeFilter({
	name: 'blur',
	method: 'blur',
	radius: 20,
	shrinkingRadius: true,
	includeAlpha: true,
	passes: 3,
});

// Matrix filter
scrawl.makeFilter({
	name: 'matrix',
	method: 'matrix',
	weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],

// Matrix5 filter
}).clone({
	name: 'matrix5',
	method: 'matrix5',
	weights: [-1, -1, -1, -1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
});

// First user-defined filter
scrawl.makeFilter({
	name: 'totalRed',
	method: 'userDefined',

	userDefined: `
		for (let i = 0, iz = cache.length; i < iz; i++) {

			data[cache[i]] = 255;
		}`,
});


// Second user-defined filter
scrawl.makeFilter({
	name: 'venetianBlinds',
	method: 'userDefined',

	level: 9,

	userDefined: `
		let i, iz, j, jz,
			level = filter.level || 6,
			halfLevel = level / 2,
			yw, transparent, pos;

		for (i = localY, iz = localY + localHeight; i < iz; i++) {

			transparent = (i % level > halfLevel) ? true : false;

			if (transparent) {

				yw = (i * iWidth) + 3;
				
				for (j = localX, jz = localX + localWidth; j < jz; j ++) {

					pos = yw + (j * 4);
					data[pos] = 0;
				}
			}
		}`,
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

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});


// Event listeners
let events = function () {

	let base = canvas.base,
		group = scrawl.library.group[base.name],
		currentTarget, currentFilter;

	return function (e) {

		e.preventDefault();
		e.returnValue = false;

		let action = false, 
			val;

		switch (e.target.id) {

			case 'target':
				val = e.target.value;

				if (val !== currentTarget) {

					currentTarget = val;
					action = true;
				}
				break;

			case 'filter':
				val = e.target.value;

				if(val !== currentFilter){

					currentFilter = val.split(',');
					action = true;
				}
				break;
		}

		if (action) {

			base.clearFilters();
			group.clearFilters();
			group.clearFiltersFromEntitys();

			if (currentTarget && currentFilter) {

				switch (currentTarget) {

					case 'block1' :
						block1.addFilters(...currentFilter);
						break;

					case 'block2' :
						block2.addFilters(...currentFilter);
						break;

					case 'wheel1' :
						wheel1.addFilters(...currentFilter);
						break;

					case 'wheel2' :
						wheel2.addFilters(...currentFilter);
						break;

					case 'group' :
						group.addFilters(...currentFilter);
						break;

					case 'cell' :
						base.addFilters(...currentFilter);
						break;
				}
			}
		}
	};
}();

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

// Set the DOM input values
document.querySelector('#target').value = '';
document.querySelector('#filter').value = '';
