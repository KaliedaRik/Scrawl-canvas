import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	group = scrawl.library.group.mystack,
	item, i, iz,
	colorFactory,
	getRandom = (n) => Math.round(Math.random() * n);

stack.set({
	width: 600,
	height: 600,
}).render()
.then(() => {

	colorFactory = scrawl.makeColor({
		name: 'myColorObject',
		rMax: 200,
		gMax: 50,
		bMax: 10,
	});

	for (i = 0, iz = group.artefacts.length; i < iz; i++) {

		let d = getRandom(50) + 50;

		item = artefact[group.artefacts[i]];
		
		item.set({
			width: d,
			height: d,
			startX: getRandom(20) + 40 + '%',
			startY: getRandom(20) + 40 + '%',
			handleX: getRandom(500) - 250,
			handleY: getRandom(500) - 250,
			roll: getRandom(360),
			collides: true,
			delta: {
				roll: (getRandom(5) / 10) + 0.25
			},
			css: {
				backgroundColor: colorFactory.get('random')
			}
		}).apply();
	}
})
.catch(() => {});


// Animation loop
scrawl.makeAnimation({

	name: 'testD015Display',

	fn: function () {

		return new Promise((resolve) => {

			let targets;

			stack.removeArtefactClasses('make_opaque');

			targets = stack.getAllArtefactsAt();

			for(i = 0, iz = targets.length; i < iz; i++) {
				targets[i].addClasses('make_opaque');
			}

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}<br />Hits: ${targets.length}`;

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
