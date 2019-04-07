import scrawl from '../source/scrawl.js';
scrawl.setScrawlPath('/source');


// Test variables
let artefact = scrawl.library.artefact,
	current = '';


// Define demo variables. All Scrawl-canvas wrappers for DOM elements can be found in the __scrawl.library.artefact__ section of the Scrawl-canvas library. The elements themselves are held in the __domElement__ attribute of the wrapper. 
let myStack = artefact.mystack,
	report = artefact.reportmessage,
	el = myStack.domElement,
	name = myStack.name,
	uuid = myStack.uuid;


// The animation loop (which in this instance will only render the stack once) updates the output with details of the stack's dimensions and positioning, and details of the mouse cursor's position in relation to the stack's top-left hand corner.
//
// Much of the data required for the information panel is contained in the stack wrapper's __here__ object. This data is updated every time Scrawl-canvas detects some sort of user interaction such as a mouse/pointer cursor movement, page scrolling, or when the browser window resizes.
scrawl.makeAnimation({


	// Giving the animation object a name will make it easy to find in the Scrawl-canvas library object
	name: 'testD001Display',

	
	// Every animation object must include a __fn__ function attribute which MUST return a Promise object - even if the functionality within the function is entirely synchronous. This is because some animation functions (for instance: tweens) rely on web workers to speed up their calculations which are - by definition - asynchronous. The promise should resolve as true if all is well; false otherwise
	fn: function () {

		return new Promise((resolve) => {


			// Position and size the demo output &lt;div> element - we do this (once) in the animation object because doing it as part of the code outside the animation won't work, due to the asynchronous way that Scrawl-canvas renders its stacks and canvases as part of the display cycle.
			if (report.get('startY') !== '50%') {

				report.set({
					startY: '50%',
					width: '91.5%',
					height: 'auto'
				});

				// Render the stack once
				scrawl.render().catch();
			}

			let here = myStack.here || {};

			reportmessage.innerHTML =  `File dom-001.js has loaded successfully<br />
			${name} (width: ${here.w}, height: ${here.h})<br />
			uuid: ${uuid}<br />
			window.pageYOffset: ${window.pageYOffset}<br />
			type: ${here.type} - x: ${here.x}, y: ${here.y} - active: ${here.active}<br />
			normals - x: ${(here.normX && here.normX.toFixed) ? here.normX.toFixed(4) : 'not known'}, 
			y: ${(here.normY && here.normY.toFixed) ? here.normY.toFixed(4) : 'not known'}`;

			resolve(true);
		});
	}
});
