import scrawl from '../source/scrawl.js'

// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');

// Scene setup
let library = scrawl.library,
	artefact = library.artefact,
	stack = library.stack,
	element = library.element,
	artefactnames = library.artefactnames,
	stacknames = library.stacknames,
	elementnames = library.elementnames,
	stopE, controls,
	b1 = document.querySelector('#action_1'),
	b2 = document.querySelector('#action_2'),
	b3 = document.querySelector('#action_3'),
	b4 = document.querySelector('#action_4'),
	newStack = false,
	hostStack = false,
	hostKilled = false;

b1.disabled = false;
b2.disabled = true;
b3.disabled = false;
b4.disabled = true;


// Event listeners
stopE = (e) => {

	if (e) {
		e.preventDefault();
		e.returnValue = false;
	}
};

controls = (e) => {

	stopE(e);
	
	switch (e.target.id) {

		case 'action_1':
			b1.disabled = true;
			b2.disabled = false;

			if (hostKilled) newStack = scrawl.addStack();
			else{

				newStack = scrawl.addStack({
					host: '#stack_host'
				});
			}

			newStack.set({
				width: 300,
				height: 100
			});

			break;

		case 'action_2':

			b1.disabled = false;
			b2.disabled = true;

			newStack.demolish(true);
			newStack = false;

			break;

		case 'action_3':

			b3.disabled = true;
			b4.disabled = false;

			hostStack = scrawl.addStack({
				element: '#stack_host'
			});

			break;
			
		case 'action_4':

			if (b1.disabled) {

				b1.disabled = false;
				b2.disabled = true;
			}

			b3.disabled = true;
			b4.disabled = true;
			
			hostStack.demolish(true);
			
			newStack = false;
			hostStack = false;
			hostKilled = true;
			
			break;
	}
};

scrawl.addListener('up', controls, '.controls');

// Animation loop
scrawl.makeAnimation({

	name: 'testD017Display',

	fn: function () {

		return new Promise((resolve) => {

			let a = Object.keys(artefact),
				s = Object.keys(stack),
				el = Object.keys(element);

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				<br />artefact - ${a.length}, ${artefactnames.length}: ${JSON.stringify(artefactnames)} 
				<br />stack - ${s.length}, ${stacknames.length}: ${JSON.stringify(stacknames)} 
				<br />element - ${el.length}, ${elementnames.length}: ${JSON.stringify(elementnames)}`;

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
