import scrawl from '../source/scrawl.js'


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
	css: {
		border: '1px solid black'
	}
}).setBase({
	width: 1000,
	height: 1000,
	backgroundColor: 'lightgray'
});

scrawl.makeBlock({
	name: 'entity-1',
	width: 200,
	height: 200,
	startX: 350,
	startY: 350,
	handleX: 'center',
	handleY: 'center',

	fillStyle: 'blue',
	strokeStyle: 'gold',
	lineWidth: 6,
	method: 'fillDraw',
}).clone({
	method: 'drawFill',
	fillStyle: 'coral',
	name: 'entity-2',
	width: 120,
	startX: 650,
});

scrawl.makeWheel({
	name: 'entity-3',
	radius: 100,
	startX: 650,
	startY: 650,
	order: 1,

	fillStyle: 'red',
	method: 'fillDraw',
}).clone({
	name: 'entity-4',
	startX: 350,
	strokeStyle: 'pink',
	radius: 60,
	lineWidth: 15,
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

endDrag = function(e) {

	stopE(e);

	if (current && current.artefact) {

		current.artefact.dropArtefact();
		current = false;
	}
};

scrawl.addListener('down', startDrag, canvas.domElement);
scrawl.addListener(['up', 'leave'], endDrag, canvas.domElement);


// Animation 
scrawl.makeAnimation({

	name: 'testC007Display',
	
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
