import scrawl from '../source/scrawl.js'

// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// Scene setup
let canvas = scrawl.library.canvas.mycanvas,
	base = scrawl.library.cell.mycanvas_base,
	cell;

canvas.setBase({
	width: 1200,
	height: 800,
	backgroundColor: 'lightgreen'
}).setNow({
	fit: 'fill'
});

cell = canvas.buildCell({
	name: 'mycell',
	width: '50%',
	height: '50%',
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	backgroundColor: 'blue',
	lockTo: 'start',
});

// Animation 
scrawl.makeAnimation({

	name: 'testC002Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				cell.set({
					lockTo: (canvas.here.active) ? 'mouse' : 'start',
				});

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />Display - x: ${canvas.here.x}; y: ${canvas.here.y} - active: ${canvas.here.active}
				<br />Base - x: ${base.here.x}; y: ${base.here.y}`;

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
