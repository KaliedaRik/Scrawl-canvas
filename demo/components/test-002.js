import scrawl from '../../source/scrawl.js'

/*
### 'Green box' component

__Purpose:__ adds a translucent green box to an element.

__Function input:__ the DOM element, or a handle to it, as the only argument.

__Function output:__ a Javascript object will be returned, containing the following attributes

    {
		element     // the Scrawl-canvas wrapper for the DOM element supplied to the function
	    canvas      // the Scrawl-canvas wrapper for the component's canvas
	    animation   // the Scrawl-canvas animation object
	    demolish    // remove the component from the Scrawl-canvas library
	}

__Usage example:__

    import scrawl from '../relative/or/absolute/path/to/scrawl.js';
    import { greenBox } from './relative/or/absolute/path/to/this/file.js';

    let myElements = document.querySelectorAll('.some-class');
    myElements.forEach(el => greenBox(el));

__Effects on the element:__ no additional effects.
*/
const greenBox = (el) => {

	let component = scrawl.makeComponent({
		domElement: el,
	});

	if (component) {

		let canvas = component.canvas;
		canvas.setAsCurrentCanvas();

		scrawl.makeBlock({

			width: '50%',
			height: '50%',
			startX: '25%',
			startY: '25%',
			globalAlpha: 0.3,
			strokeStyle: 'lightgreen',
			lineWidth: 40,
			method: 'draw',
		});
	}

	return component;
};

// Export the component definition functions
export {
	greenBox,
}
