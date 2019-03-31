import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	flower = artefact.flower,
	leftbox = artefact.leftbox,
	rightbox = artefact.rightbox,
	currentClass = '',
	hitgroup;

hitgroup = scrawl.makeGroup({
	name: 'hitareas',
	host: 'mystack',
	visibility: false,
}).addArtefacts(leftbox, rightbox);

stack.set({
	width: 600,
	height: 400,
}).render()
.then(() => {

	stack.set({
		actionResize: true,
		css: {
			overflow: 'hidden',
			resize: 'both'
		}
	});

	hitgroup.setArtefacts({
		width: '35%',
		height: '60%',
		collides: true
	});

	rightbox.set({
		startX: '55%',
		startY: '15%',
		css: {
			backgroundColor: 'rgba(255, 0, 0, 0.4)'
		}
	});

	leftbox.set({
		startX: '10%',
		startY: '25%',
		css: {
			backgroundColor: 'rgba(0, 0, 255, 0.4)'
		}
	});

	flower.set({
		width: 200,
		height: 200,
		startX: '50%',
		startY: '50%',
		handleX: 'center',
		handleY: 'center',
		delta: {
			startX: '0.4%',
			startY: '-0.3%',
			roll: 0.5,
		},
	}).apply();
})
.catch(() => {});


// Animation loop
scrawl.makeAnimation({

	name: 'testD014Display',

	fn: function () {

		return new Promise((resolve) => {

			let start, dims, changes, 
				current, testClass,
				minX, minY, maxX, maxY;

			start = flower.getStart();
			dims = stack.getDimensions();
			minX = dims.w / 10;
			minY = dims.h / 10;
			maxX = minX * 9;
			maxY = minY * 9;

			if (start.x < minX || start.x > maxX || start.y < minY || start.y > maxY) {

				flower.reverseByDelta();

				changes = {};
				if (start.x < minX || start.x > maxX) {
					changes.startX = true;
				}
				if (start.y < minY || start.y > maxY) {
					changes.startY = true;
				}

				flower.setDeltaValues(changes, 'reverse');
				flower.updateByDelta();
			}

			start = flower.getStart();
			current = hitgroup.getArtefactAt(start).artefact;

			testClass = '';
			if(current){
				testClass = (current.name === 'leftbox') ? 'make_blue' : 'make_red';
			}

			if(testClass !== currentClass){
				if(currentClass){
					flower.removeClasses(currentClass);
				}
				else{
					flower.addClasses(testClass);
				}
				currentClass = testClass;
			}

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
})
