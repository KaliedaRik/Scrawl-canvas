import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	canvas = artefact.mycanvas,
	graddy;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

graddy = scrawl.makeRadialGradient({
	name: 'mygradient',
	startX: '30%',
	startY: '30%',
	endX: '50%',
	endY: '50%',
	endRadius: 300,
	paletteStart: 200,
	paletteEnd: 800,
	delta: {
		paletteStart: -1,
		paletteEnd: -1
	},
	cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(99, 'red')
.updateColor(199, 'black')
.updateColor(299, 'blue')
.updateColor(399, 'black')
.updateColor(499, 'gold')
.updateColor(599, 'black')
.updateColor(699, 'green')
.updateColor(799, 'black')
.updateColor(899, 'lavender')
.updateColor(999, 'black');

scrawl.makeBlock({
	name: 'myblock',
	width: '90%',
	height: '90%',
	startX: '5%',
	startY: '5%',

	fillStyle: graddy,
	strokeStyle: 'coral',
	lineWidth: 6,
	method: 'fillDraw',
});


// Animation 
scrawl.makeAnimation({

	name: 'testC014Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			// Unlike for artefacts, gradient delta changes don't happen automatically as part of the display cycle
			// - they need to be invoked directly as part of the animation loop
			graddy.updateByDelta();

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />paletteStart: ${graddy.paletteStart}; paletteEnd: ${graddy.paletteEnd}`;

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
