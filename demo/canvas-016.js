import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let lib = scrawl.library,
	canvas = lib.artefact.mycanvas,
	base = canvas.base,
	group = lib.group[base.name],
	stopE, events, currentTarget, currentFilter,
	block1, block2, wheel1, wheel2;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

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

block1 = scrawl.makeBlock({
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

block2 = block1.clone({
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

wheel1 = scrawl.makeWheel({
	name: 'w1',
	radius: '20%',
	startX: '70%',
	startY: '30%',
	fillStyle: 'linear3',
	lockFillStyleToEntity: true,
	strokeStyle: 'orange',
	lineWidth: 4,
	method: 'fillDraw',
});

wheel2 = wheel1.clone({
	name: 'w2',
	startX: '32%',
	startY: '82%',
	handleX: '15%',
	scale: 0.7,
	fillStyle: 'linear4',
	strokeStyle: 'lightblue',
	delta: {
		roll: 1
	},
	order: 1,
});


// Define filters, starting with grayscale filter
scrawl.makeFilter({
	name: 'grayscale',
	method: 'grayscale'

// sepia filter
}).clone({
	name: 'sepia',
	method: 'sepia'

// invert filter
}).clone({
	name: 'invert',
	method: 'invert'

// red filter
}).clone({
	name: 'red',
	method: 'red'

//green filter
}).clone({
	name: 'green',
	method: 'green'

// blue filter
}).clone({
	name: 'blue',
	method: 'blue'

// notred filter
}).clone({
	name: 'notred',
	method: 'notred'

// notgreen filter
}).clone({
	name: 'notgreen',
	method: 'notgreen'

// notblue filter
}).clone({
	name: 'notblue',
	method: 'notblue'

// cyan filter
}).clone({
	name: 'cyan',
	method: 'cyan'

// magenta filter
}).clone({
	name: 'magenta',
	method: 'magenta'

// yellow filter
}).clone({
	name: 'yellow',
	method: 'yellow'

// chroma filter
}).clone({
	name: 'chroma',
	method: 'chroma',
	ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]]

// brightness filter
}).clone({
	name: 'brightness',
	method: 'brightness',
	level: 0.5

// saturation filter
}).clone({
	name: 'saturation',
	method: 'saturation',
	level: 1.4

// threshhold filter
}).clone({
	name: 'threshold',
	method: 'threshold',
	level: 127

// channels filter
}).clone({
	name: 'channels',
	method: 'channels',
	red: 0.4,
	green: 0.8,
	blue: 0.6

// channelstep filter
}).clone({
	name: 'channelstep',
	method: 'channelstep',
	red: 64,
	green: 64,
	blue: 64

// tint filter
}).clone({
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
	blueInBlue: 0.4

// pixellate filter
}).clone({
	name: 'pixelate',
	method: 'pixelate',
	tileWidth: 20,
	tileHeight: 20,
	offsetX: 8,
	offsetY: 8

// blur filter
}).clone({
	name: 'blur',
	method: 'blur',
	radius: 20,
	shrinkingRadius: true,
	includeAlpha: true,
	passes: 3

// matrix filter
}).clone({
	name: 'matrix',
	method: 'matrix',
	includeAlpha: false,
	weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1]

// matrix5 filter
}).clone({
	name: 'matrix5',
	method: 'matrix5',
	includeAlpha: false,
	weights: [-1, -1, -1, -1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 1]

// first user-defined filter
}).clone({
	name: 'ud1',
	method: false,
	returnCacheArray: true,
	userFilter: 'ud1'

// second user-defined filter - same as first, but with added grayscale
}).clone({
	name: 'ud2',
	method: 'grayscale',

// third user-defined filter
}).clone({
	name: 'ud3',
	level: 9,
	method: 'sepia',
	userFilter: 'ud3',
	returnLocalDimensions: true
});

// user-defined filter function, for use with first and second user-defined filters
lib.userFilter.ud1 = function (image, vars, dims, cache) {

	let i, iz, 
		data = image.data;

	// set all red channel values to 255
	for (i = 0, iz = cache.length; i < iz; i++) {

		data[cache[i]] = 255;
	}

	return image;
};

// user-defined filter function, for use with third user-defined filter
lib.userFilter.ud3 = function (image, vars, dims, cache) {

	let i, iz, j, jz,
		data = image.data,
		level = vars.level,
		halfLevel = level / 2,
		w = image.width * 4,
		yw, action, pos;

	// venetian blinds
	for (i = dims.y, iz = dims.y + dims.h; i < iz; i++) {

		action = (i % level > halfLevel) ? true : false;

		if (action) {

			yw = (i * w) + 3;
			
			for (j = dims.x, jz = dims.x + dims.w; j < jz; j ++) {

				pos = yw + (j * 4);
				data[pos] = 0;
			}
		}
	}

	return image;
};


// Set the DOM input values
document.querySelector('#target').value = '';
document.querySelector('#filter').value = '';


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

events = (e) => {

	let action = false,
		val, oldFilter;

	stopE(e);

	switch (e.target.id) {

		case 'target':
			val = e.target.value;

			if (val !== currentTarget) {

				oldFilter = currentFilter;
				currentTarget = val;
				action = true;
			}
			break;

		case 'filter':
			val = e.target.value;

			if(val !== currentFilter){

				oldFilter = currentFilter;
				currentFilter = val;
				action = true;
			}
			break;
	}

	if (action) {

		if (oldFilter) {

			base.removeFilters(oldFilter);
			group.removeFilters(oldFilter);
			group.removeFiltersFromEntitys(oldFilter);
		}

		if (currentTarget && currentFilter) {

			switch (currentTarget) {

				case 'block1' :
					block1.addFilters(currentFilter);
					break;

				case 'block2' :
					block2.addFilters(currentFilter);
					break;

				case 'wheel1' :
					wheel1.addFilters(currentFilter);
					break;

				case 'wheel2' :
					wheel2.addFilters(currentFilter);
					break;

				case 'group' :
					group.addFilters(currentFilter);
					break;

				case 'cell' :
					base.addFilters(currentFilter);
					break;
			}
		}
	}
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Animation 
scrawl.makeAnimation({

	name: 'testC016Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			canvas.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

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
