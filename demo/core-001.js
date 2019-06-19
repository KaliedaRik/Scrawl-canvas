// Import the Scrawl-canvas file, using: 
// - either an absolute path to it; 
// - or a path relative to the html file which loaded this user-defined javascript file
import scrawl from '../source/scrawl.js'

// Because we're loading this script as a module, it doesn't know where it is through normal functions such as document.currentScript
// - instead, we tell Scrawl-canvas where it is
// - Scrawl-canvas can then use that information to correctly find and load web worker files
scrawl.setScrawlPath('/source');

// To see the Scrawl-canvas associated module files load, use the browser's file inspection console

// Test variables
let report = document.querySelector('#reportmessage');

// Animation
scrawl.makeAnimation({

	name: 'demo-animation',

	fn: function () {

		return new Promise((resolve) => {

			// If all modules load and run correctly, we should see data appear in the web page
			report.textContent = `cursor x: ${scrawl.currentCorePosition.x}
cursor y: ${scrawl.currentCorePosition.y}
browser width: ${scrawl.currentCorePosition.w}
browser height: ${scrawl.currentCorePosition.h}
scroll x: ${scrawl.currentCorePosition.scrollX}
scroll y: ${scrawl.currentCorePosition.scrollY}
cursor type: ${scrawl.currentCorePosition.type}`;

			resolve(true);
		});
	},
});
