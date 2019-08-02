import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.artefact.mycanvas,
	hold = scrawl.library.artefact.holdcanvas;

canvas.set({
	fit: 'fill',
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});


// Create gradients
scrawl.makeGradient({
	name: 'linear1',
	endX: '100%',
})
.updateColor(0, 'pink')
.updateColor(999, 'darkgreen');

scrawl.makeGradient({
	name: 'linear2',
	endX: '100%',
})
.updateColor(0, 'darkblue')
.updateColor(999, 'white');

scrawl.makeGradient({
	name: 'linear3',
	endX: '100%',
})
.updateColor(0, 'yellow')
.updateColor(999, 'purple');

scrawl.makeGradient({
	name: 'linear4',
	endX: '100%',
})
.updateColor(0, 'black')
.updateColor(999, 'coral');


// Create entitys
let block1 = scrawl.makeBlock({
	name: 'b1',
	group: canvas.base.name,

	width: '70%',
	height: '70%',
	startX: '5%',
	startY: '5%',

	fillStyle: 'linear1',
	lockFillStyleToEntity: true,
	strokeStyle: 'coral',
	lineWidth: 4,
	method: 'fillThenDraw',
});

let block2 = block1.clone({
	name: 'b2',
	startX: '70%',
	startY: '65%',
	handleX: 'center',
	handleY: 'center',
	scale: 0.5,
	fillStyle: 'linear2',
	strokeStyle: 'red',

	delta: {
		roll: -0.5
	},
	order: 1,
});

let wheel1 = scrawl.makeWheel({
	name: 'w1',
	group: canvas.base.name,

	radius: '15%',
	startX: '80%',
	startY: '30%',
	handleX: 'center',
	handleY: 'center',
	fillStyle: 'linear3',
	lockFillStyleToEntity: true,
	strokeStyle: 'orange',
	lineWidth: 4,
	method: 'fillThenDraw',
});

let wheel2 = wheel1.clone({
	name: 'w2',
	startX: '30%',
	startY: '60%',
	handleX: '-10%',
	handleY: 'center',
	scale: 0.7,
	fillStyle: 'linear4',
	strokeStyle: 'lightblue',

	delta: {
		roll: 1
	},
	order: 1,
});


// Invert filter
scrawl.makeFilter({
	name: 'invert',
	method: 'invert',
});


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, dragging,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Add Picture entitys to the hold canvas, using the assets we will create from the main canvas
scrawl.makePicture({
	name: 'cell-image',
	group: hold.base.name,

	width: '13%',
	height: '96%',

	startX: '3%',
	startY: '2%',

	asset: 'mycanvas_base-image',
	copyWidth: '100%',
	copyHeight: '100%',

	lineWidth: 4,
	strokeStyle: 'orange',

	method: 'drawThenFill',
}).clone({

	name: 'group-image',
	asset: 'mycanvas_base-groupimage',
	startX: '19%',

}).clone({

	name: 'b1-image',
	asset: 'b1-image',
	startX: '35%',

}).clone({

	name: 'b2-image',
	asset: 'b2-image',
	startX: '51%',

}).clone({

	name: 'w1-image',
	asset: 'w1-image',
	startX: '67%',

}).clone({

	name: 'w2-image',
	asset: 'w2-image',
	startX: '83%',
});


// Create the Animation loop which will run the Display cycle - note that this demo runs two canvases
scrawl.makeRender({

	name: 'demo-animation',
	afterShow: report,
});


// A function to trigger updates to the image assets we create from the entitys, group and cell
let updateAssets = function () {
	scrawl.createImageFromCell(canvas, true);
	scrawl.createImageFromGroup(canvas, true);
	scrawl.createImageFromEntity(block1, true);
	scrawl.createImageFromEntity(block2, true);
	scrawl.createImageFromEntity(wheel1, true);
	scrawl.createImageFromEntity(wheel2, true);
};

/*
Initial generation of image assets - the Picture entitys created above won't display until this happens

KNOWN ISSUE - it takes time for the images to load the new dataURLs generated from canvas elements

ANNOYING ISSUE - images generated from cells are (currently) buggy - a timing issue, I think
*/
setTimeout(updateAssets, 100);


// Event listeners
let events = function () {

	let base = canvas.base,
		group = scrawl.library.group[base.name],
		currentTarget;

	return function (e) {

		e.preventDefault();
		e.returnValue = false;

		let val = e.target.value;

		if (val !== currentTarget) {

			currentTarget = val;

			base.clearFilters();
			group.clearFilters();
			group.clearFiltersFromEntitys();

			switch (currentTarget) {

				case 'block1' :
					block1.addFilters('invert');
					break;

				case 'block2' :
					block2.addFilters('invert');
					break;

				case 'wheel1' :
					wheel1.addFilters('invert');
					break;

				case 'wheel2' :
					wheel2.addFilters('invert');
					break;

				case 'group' :
					group.addFilters('invert');
					break;

				case 'cell' :
					base.addFilters('invert');
					break;
			}

			// Regenerate the image assets
			setTimeout(updateAssets, 100);
		}
	};
}();
scrawl.addNativeListener(['input'], events, '.controlItem');

// Set the DOM input values
document.querySelector('#target').value = '';
