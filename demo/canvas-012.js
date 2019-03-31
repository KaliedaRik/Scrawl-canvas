import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let lib = scrawl.library,
	canvas = lib.artefact.mycanvas,
	cell = canvas.base,
	group = lib.group[cell.name],
	stopE, startDrag, endDrag, current;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makeGradient({
	name: 'linear',
	endX: '100%',
})
.updateColor(0, 'blue')
.updateColor(495, 'red')
.updateColor(500, 'yellow')
.updateColor(505, 'red')
.updateColor(999, 'green');

scrawl.makeBlock({
	name: 'static_block',
	width: 150,
	height: 150,
	startX: 150,
	startY: 150,
	handleX: 'center',
	handleY: 'center',
	fillStyle: 'linear',
	strokeStyle: 'coral',
	lineWidth: 6,
	method: 'fillDraw',
}).clone({
	name: 'rolling_block',
	delta: {
		roll: 0.5
	},
	scale: 1.2,
	startY: 450,
});

scrawl.makeWheel({
	name: 'static_wheel',
	radius: 75,
	startX: 450,
	startY: 150,
	fillStyle: 'linear',
	strokeStyle: 'coral',
	lineWidth: 6,
	method: 'fillDraw',
}).clone({
	name: 'rolling_wheel',
	delta: {
		roll: -0.5
	},
	scale: 1.2,
	lineDash: [4, 4],
	startY: 450,
});


// Event listeners
stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

startDrag = (e) => {

	stopE(e);
	
	if (canvas.here.active) {

		current = group.getArtefactAt(cell.here);
		
		if (current.artefact) current.artefact.pickupArtefact(current);
	}
};

endDrag = (e) => {

	stopE(e);

	if (current) {

		current.artefact.dropArtefact();
		current = false;
	}
};

scrawl.addListener('down', startDrag, canvas.domElement);
scrawl.addListener(['up', 'leave'], endDrag, canvas.domElement);


// Animation 
scrawl.makeAnimation({

	name: 'testC012Display',
	
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
