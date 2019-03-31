import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	canvas = artefact.mycanvas,
	tweeny, tweenEngine, stopE, runTween;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makeGradient({
	name: 'mygradient',
	endX: '100%',
	cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(49, 'yellow')
.updateColor(99, 'black')
.updateColor(149, 'lightyellow')
.updateColor(199, 'black')
.updateColor(249, 'goldenrod')
.updateColor(299, 'black')
.updateColor(349, 'lemonchiffon')
.updateColor(399, 'black')
.updateColor(449, 'gold')
.updateColor(499, 'black')
.updateColor(549, 'tan')
.updateColor(599, 'black')
.updateColor(649, 'wheat')
.updateColor(699, 'black')
.updateColor(749, 'yellowgreen')
.updateColor(799, 'black')
.updateColor(849, 'peachpuff')
.updateColor(899, 'black')
.updateColor(949, 'papayawhip')
.updateColor(999, 'black');

scrawl.makeBlock({
	name: 'myblock',
	width: '90%',
	height: '90%',
	startX: '5%',
	startY: '5%',

	fillStyle: 'mygradient',
	strokeStyle: 'coral',
	lineWidth: 4,
	method: 'fillDraw',
});


// Tween template
tweenEngine = (start, change, position) => {

	let temp = 1 - position,
		val;

	// This is a fairly basic ease-in-out function: the tween will call the function with start, change and position arguments, and the function is required to return a value calculated from those arguments
	val = (position < 0.5) ?
		start + ((position * position) * change * 2) :
		(start + change) + ((temp * temp) * -change * 2);

	// We're asking the tween to calculate an ease over 3000 steps, but the palette cursors (paletteStart, paletteEnd) are only permitted to have integer values between 0 and 999. Effectively we're asking the tween to cycle through the palette 3 times.
	return val % 1000;
};

tweeny = scrawl.makeTween({
	name: 'mytween',
	targets: 'mygradient',
	duration: 5000,
	cycles: 1,
	definitions: [{
		attribute: 'paletteStart',
		integer: true,
		start: 0,
		end: 2999,
		engine: tweenEngine
	}, {
		attribute: 'paletteEnd',
		integer: true,
		start: 999,
		end: 3998,
		engine: tweenEngine
	}]
});


// Event listener
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

runTween = (e) => {

	stopE(e);
	tweeny.run();
};

scrawl.addListener('up', runTween, canvas.domElement);


// Animation 
scrawl.makeAnimation({

	name: 'testC014Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
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
