import scrawl from '../source/scrawl.js'

// test variables
let report = document.querySelector('#testmessage'),
	current = '';

// code here

// updating time display - animation object
scrawl.makeAnimation({
	name: 'templateAnimation',
	order: 0,
	fn: function () {
		return new Promise((resolve) => {

			current = `
				cursor x: ${scrawl.currentCorePosition.x}<br />
				cursor y: ${scrawl.currentCorePosition.y}<br />
				browser width: ${scrawl.currentCorePosition.w}<br />
				browser height: ${scrawl.currentCorePosition.h}<br />
				cursor type: ${scrawl.currentCorePosition.type}`;

			report.innerHTML = current;

			resolve(true);
		});
	},
});
