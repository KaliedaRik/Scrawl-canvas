import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	canvas = artefact.mycanvas,
	stopE, events,
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
	startX: '50%',
	startY: '50%',
	endX: '50%',
	endY: '50%',
	endRadius: 300,
});

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


// Set the DOM input values
document.querySelector('#paletteStart').value = 0;
document.querySelector('#paletteEnd').value = 999;
document.querySelector('#startX').value = 50;
document.querySelector('#startY').value = 50;
document.querySelector('#startRadius').value = 0;
document.querySelector('#endX').value = 50;
document.querySelector('#endY').value = 50;
document.querySelector('#endRadius').value = 300;
document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

events = (e) => {

	let items = {},
		val;

	stopE(e);

	switch (e.target.id) {

		case 'paletteStart':
			items.paletteStart = parseInt(e.target.value, 10);
			break;

		case 'paletteEnd':
			items.paletteEnd = parseInt(e.target.value, 10);
			break;

		case 'startX':
			items.startX = e.target.value + '%';
			break;

		case 'startY':
			items.startY = e.target.value + '%';
			break;

		case 'startRadius':
			items.startRadius = parseInt(e.target.value, 10);
			break;

		case 'endX':
			items.endX = e.target.value + '%';
			break;

		case 'endY':
			items.endY = e.target.value + '%';
			break;

		case 'endRadius':
			items.endRadius = parseInt(e.target.value, 10);
			break;

		case 'red':
			val = parseInt(e.target.value, 10);
			
			if (val) {

				graddy.updateColor(350, 'red');
			}
			else {

				graddy.removeColor(350);
			}
			break;

		case 'blue':
			val = parseInt(e.target.value, 10);

			if (val) {

				graddy.updateColor(650, 'blue');
			}

			else {

				graddy.removeColor(650);
			}
			break;
	}
	graddy.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Animation 
scrawl.makeAnimation({

	name: 'testC011Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />Palette - start: ${graddy.paletteStart}; end: ${graddy.paletteEnd}
				<br />Start - x: ${graddy.start.x}; y: ${graddy.start.y}; radius: ${graddy.startRadius}
				<br />End - x: ${graddy.end.x}; y: ${graddy.end.y}; radius: ${graddy.endRadius}`;

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
