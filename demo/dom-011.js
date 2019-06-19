import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	canvas = artefact.mycanvas;


// Resize the stack, and give it some CSS
stack.set({
	width: 400,
	height: 400,
	css: {
		margin: '15px 0 0 0',
		border: '1px solid black',
		overflow: 'hidden',
		resize: 'both',
	},
	actionResize: true,
});


// Setup the (displayed) canvas element to cover the entire stack element, and to respond to changes in the Stack's dimensions
canvas.set({
	width: '100%',
	height: '100%',

	// The 'fit' attribute comes into play when the displayed canvas element and its hidden canvas companion have different dimensions. The hidden canvas is copied over to the displayed canvas at the end of every display cycle.

	// We can influence how this copy happens by setting the 'fit' attribute to an appropriate String value ('fill', 'contain', 'cover', or 'none'). These replicate the effect of the CSS object-fit property (see https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
	fit: 'fill',

	// We've given the Stack element a 1px border. We need to compensate for this (and any top/left padding) when aligning the canvas element within the stack. if we don't do this, we get a 1px white line between the stack border and the canvas (on the top and left edges)
	startX: -1,
	startY: -1,
});


// The base canvas - every displayed canvas element has at least one hidden ('base') canvas companion - does not need to replicate the displayed canvas. For instance, it can have different dimensions. The base canvas is copied over to the displayed canvas at the end of every display cycle.
canvas.setBase({
	width: 800,
	height: 600,
	backgroundColor: 'lightblue',
});


// A displayed canvas can have more than one hidden canvas. These additional 'cells' - which act much like traditional animation cels (see https://en.wikipedia.org/wiki/Cel) - will be copied onto the 'base' canvas before the it gets copied over to the displayed cell at the end of every display cycle.
let cell = canvas.buildCell({
	name: 'mycell',
	width: '50%',
	height: '50%',
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	roll: 12,
	scale: 1.2,
	backgroundColor: 'blue',
});


// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
let check = function () {

	let active = false,
		here = canvas.here,
		cell = scrawl.library.asset.mycell;

	return function () {

		if (here.baseActive !== active) {

			active = here.baseActive;

			cell.set({
				lockTo: (active) ? 'mouse' : 'start',
			});
		}
	};
}();


let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, text,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


/// Animation object - not using scrawl.makeRender() in this instance because we need to render both the stack and the canvas - functionality is for stacks to render the positioning of constituent artefacts, but won't do anything to trigger canvas composition. Instead, we'll use the more generic scrawl.render() function which calls the display cycle on both stacks and canvases; there's also scrawl.clear, scrawl.compile and scrawl.show functions for more fine-grained control of the display cycle when using this approach to construct the Animation/Display cycle.
scrawl.makeAnimation({

	name: 'demo-animation',
	
	fn: function(){
		
		return new Promise((resolve, reject) => {

			check();

			scrawl.render()
			.then(() => {

				report();
				resolve(true);
			})
			.catch(err => reject(false));
		});
	}
});


// Event listeners
let events = (e) => {

	e.preventDefault();
	e.returnValue = false;

	switch (e.target.id) {

		case 'fitselect' :
			canvas.set({ fit: e.target.value });
			break;

		case 'stackwidth' :
			let w = e.target.value;

			if (w === 'thin') stack.set({ width: 200 });
			else if (w === 'square') stack.set({ width: 400 });
			else if (w === 'wide') stack.set({ width: 600 });
			else if (w === 'massive') stack.set({ width: 1000 });
	}
};
scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

// Set the DOM input values
document.querySelector('#fitselect').value = 'fill';
document.querySelector('#stackwidth').value = 'square';


/*
Dev tip 1: Scrawl-canvas doesn't add a namespace object to the Javascript global object. To see what's going on in the Scrawl-canvas library - where all relevant SC objects are held - console log it (in the code file, not directly in the browser console):

    console.log(scrawl.library);

* doesn't update in real time, but closing and opening the object in the console should reveal values at the point in time when it is reopened
* In Chrome console (at least), the various objects in the library will be listed with their object type eg Stack, Canvas, Cell, etc

If you only want to view a specific part of the library - for example, just artefacts - console log it out in the same way:

    console.log(scrawl.library.artefact);

*/
// console.log(scrawl.library)

/*
Dev tip 2: to see what's going on in any hidden canvas, temporarily add it to the bottom of the page, or insert it wherever using appropriate DOM API functionality:

    document.body.appendChild(scrawl.library.cell[NAME].element);
*/
// document.body.appendChild(scrawl.library.cell.mycanvas_base.element);
// document.body.appendChild(scrawl.library.cell.mycell.element);
