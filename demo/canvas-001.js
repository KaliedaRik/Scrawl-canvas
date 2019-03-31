import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setNow({
	width: 400,
	height: 200,
	fit: 'fill',
	backgroundColor: 'lightgreen',
	css: {
		border: '1px solid green'
	}
});

canvas.buildCell({
	name: 'mycell',
	width: '50%',
	height: '50%',
	startX: 'center',
	startY: 'center',
	handleX: 'center',
	handleY: 'center',
	roll: 15,
	scale: 1.39,
	backgroundColor: 'blue'
});


// Trigger a display cycle
canvas.render()
.catch(function(){});
