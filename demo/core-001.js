import scrawl from '../source/scrawl.js'

// Test variables
let report = document.querySelector('#reportmessage');

// Animation
scrawl.makeAnimation({

	name: 'templateAnimation',

	fn: function () {

		return new Promise((resolve) => {

			report.innerHTML = `
				cursor x: ${scrawl.currentCorePosition.x}<br />
				cursor y: ${scrawl.currentCorePosition.y}<br />
				browser width: ${scrawl.currentCorePosition.w}<br />
				browser height: ${scrawl.currentCorePosition.h}<br />
				scroll x: ${scrawl.currentCorePosition.scrollX}<br />
				scroll y: ${scrawl.currentCorePosition.scrollY}<br />
				cursor type: ${scrawl.currentCorePosition.type}`;

			resolve(true);
		});
	},
});
