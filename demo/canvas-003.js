import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	canvas = artefact.mycanvas,
	stopE, events;

canvas.setBase({
	width: 800,
	height: 600,
	backgroundColor: 'lightblue'
});

canvas.buildCell({
	name: 'mycell',
	width: '50%',
	height: '50%',
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	roll: 12,
	scale: 1.2,
	backgroundColor: 'blue'
});

// To make the canvas responsive, set its dimensions to (for instance) 100% of its parent stack's dimensions
canvas.setNow({
	width: '100%',
	height: '100%',
	fit: 'fill',
});

stack.set({
	width: 400,
	height: 400,
	css: {
		margin: '15px 0 0 0',
		border: '1px solid black',
		overflow: 'hidden',
		resize: 'both'
	}
}).render()
.then(() => {

	stack.set({

		// Annoying - having to set a dimension a second time to make sure canvas takes the stack's new dimensions into account
		width: 400,

		// To make sure the canvas remains responsive, set the stack .actionResize attribute to true
		actionResize: true,
	});
})
.catch(() => {});


// Set the DOM input values
document.querySelector('#fitselect').value = 'fill';


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

events = (e) => {

	stopE(e);
	canvas.set({ fit: e.target.value });
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Animation 
scrawl.makeAnimation({

	name: 'testC003Display',
	
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
